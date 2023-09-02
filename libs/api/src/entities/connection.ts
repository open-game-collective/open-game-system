import {
  ConnectionCommand,
  ConnectionContext,
  Entity,
  // InitializedConnectionContext,
  NewRoomContext,
  RoomEntity,
  SessionEntity,
  UserEntity,
  WithSenderId,
} from '@explorers-club/schema';
import {
  assert,
  assertEntitySchema,
  assertEventType,
} from '@explorers-club/utils';
import {
  HomeRoutePropsSchema,
  LoginRoutePropsSchema,
  NewRoutePropsSchema,
  RoomRoutePropsSchema,
} from '@schema/common';
import {
  ConnectionInitializeCommandSchema,
  ConnectionNavigateCommandSchema,
  ConnectionUpdatePermissionSchema,
} from '@schema/lib/connection';
import type { RoomCommand, SessionCommand } from '@schema/types';
import { World } from 'miniplex';
import { DoneInvokeEvent, assign, createMachine } from 'xstate';
// import { createEntity } from '../ecs';
import { z } from 'zod';
import { createEntity } from '../ecs';
import { roomsBySlug } from '../server/indexes';
import { entitiesById } from '../server/state';
import { newRoomMachine } from '../services';

const getSerialNumber = (() => {
  let count = 0;
  return () => {
    count = count + 1;
    return count;
  };
})();

export const createConnectionMachine = ({
  world,
  entity,
}: {
  world: World;
  entity: Entity;
}) => {
  // const { createEntity } = await import('../ecs');

  assert(
    entity && entity.schema === 'connection',
    'expected connection entity but found ' + entity.schema
  );
  const connectionEntity = entity;

  var sessionEntity = entitiesById.get(connectionEntity.sessionId);
  var userEntity: UserEntity | undefined;
  if (sessionEntity) {
    assertEntitySchema(sessionEntity, 'session');
    userEntity = entitiesById.get(sessionEntity.userId) as
      | UserEntity
      | undefined;
    assertEntitySchema(userEntity, 'user');
    sessionEntity.send({
      type: 'NEW_CONNECTION',
      connectionId: connectionEntity.id,
    } as SessionCommand);
  } else {
    userEntity = createEntity<UserEntity>({
      schema: 'user',
      profileId: undefined,
      name: undefined,
      serialNumber: getSerialNumber(),
    });
    world.add(userEntity);

    sessionEntity = createEntity<SessionEntity>({
      id: connectionEntity.sessionId,
      schema: 'session',
      userId: userEntity.id,
      connectionIds: [connectionEntity.id],
    });
    world.add(sessionEntity);
  }

  const connectionMachine = createMachine(
    {
      // /** @xstate-layout N4IgpgJg5mDOIC5QGED2A7dYDGAXAlhgLICG2AFvlgHQCS6+BJANvgF6TUBiLsYAxLQBytACq0AggBlaALQCiAbQAMAXUSgADqliNC6DSAAeiAIwBWAMzUAHADYA7KZsPzAGhABPM-eqm7pgAs5jaWYeGWpgC+UR5omDgExGSUNPR6LOyc6UysbFRQ-BAYYNRUAG6oANal8Vh4+qQUVKU5+JkcEHQMuewFCBWo2CRJ6Cqq44bauqOGJgjBAJy2js6uHt4IppG25hZ2AEzmMXEY9aNNqa097XnZNx0F-GAATi+oL9SazCMAZh8AW2odUSjRSLW6GTuXTaj3QUAG6Eqw1G40mSBA0z0GDmZisKycLncXjMlhs1DsAWCoQiYWiJxA6FQEDghhBDWSzSwUx02IMGPmAFpLMtzMoHDZTEcNohBYFAtRFgc1sdYiB2RdwWkHtCeTN9LiEOTAkqVTKFgdqOYJVLVacEhz0JcIbDodxeGA9XzDeY7NQTcqieagtYDvKHIt-JTo3ZFgyNWCudcoVkYTq+vCvbMBYgDotzNQJYtlIdiZttspqOLJUd42dQZyrpDep1qKIXgBXT0YrHZ0DzOzKazbA41st46zWscxGJAA */
      id: 'ConnectionMachine',
      type: 'parallel',
      schema: {
        context: {} as ConnectionContext,
        events: {} as WithSenderId<ConnectionCommand>, // warning sendinerId not present for initialize
      },
      context: {
        reconnectCount: -1,
      },
      states: {
        Route: {
          initial: connectionEntity.initialRouteProps.name,
          on: {
            NAVIGATE: [
              {
                target: 'Route.Home',
                cond: (_, event) =>
                  HomeRoutePropsSchema.safeParse(event.route).success,
                actions: ['setCurrentLocation'],
              },
              {
                target: 'Route.NewRoom',
                cond: (_, event) =>
                  NewRoutePropsSchema.safeParse(event.route).success,
                actions: ['setCurrentLocation'],
              },
              {
                target: 'Route.Login',
                cond: (_, event) =>
                  LoginRoutePropsSchema.safeParse(event.route).success,
                actions: ['setCurrentLocation'],
              },
              {
                target: 'Route.Room',
                cond: (_, event) =>
                  RoomRoutePropsSchema.safeParse(event.route).success,
                actions: ['setCurrentLocation'],
              },
            ],
          },
          states: {
            Home: {},
            Login: {},
            NewRoom: {
              invoke: {
                id: 'newRoomService',
                src: newRoomMachine,
                autoForward: true,
                onDone: {
                  target: 'Room',
                  actions: async (
                    _,
                    event: DoneInvokeEvent<Required<NewRoomContext>>
                  ) => {
                    const { createEntity } = await import('../ecs');
                    assertEntitySchema(sessionEntity, 'session');

                    const { gameId, roomSlug } = event.data;

                    const entity = createEntity<RoomEntity>({
                      schema: 'room',
                      slug: roomSlug,
                      hostUserId: sessionEntity.userId,
                      memberUserIds: [],
                      connectedUserIds: [],
                      gameId,
                    });
                    world.add(entity);

                    connectionEntity.currentChannelId = entity.id;
                  },
                },
              },
            },
            Room: {
              initial: 'Initializing',
              states: {
                Initializing: {
                  invoke: {
                    src: 'connectToRoom',
                    onDone: 'Initialized',
                    onError: 'Error',
                  },
                },
                Error: {
                  entry: console.error,
                },
                Initialized: {},
              },
            },
          },
        },
        Connected: {
          initial: 'No',
          states: {
            No: {
              on: {
                CONNECT: {
                  target: 'Yes',
                  actions: [
                    assign({
                      reconnectCount: ({ reconnectCount }) =>
                        reconnectCount + 1,
                    }),
                  ],
                },
              },
            },
            Yes: {
              on: {
                DISCONNECT: {
                  target: 'No',
                },
              },
            },
          },
        },
        Geolocation: {
          initial: 'Uninitialized',
          states: {
            Uninitialized: {
              on: {
                UPDATE_GEOLOCATION_POSITION: {
                  target: 'Initialized',
                  cond: (_, event) => !!event.position,
                },
              },
            },
            Initialized: {
              entry: (context, event) => {
                if (event.type === 'UPDATE_GEOLOCATION_POSITION') {
                  connectionEntity.currentGeolocation = event.position;
                } else {
                  console.warn(
                    'Expected to enter Initialized state via UPDATE_GEOLOCATION_POSITIOn event but didnt'
                  );
                }
              },
              on: {
                UPDATE_GEOLOCATION_POSITION: {
                  actions: (_, event) => {
                    connectionEntity.currentGeolocation = event.position;
                  },
                },
              },
            },
            Error: {
              entry: console.error,
            },
            Denied: {},
          },
        },
        Push: {
          type: 'parallel',
          states: {
            PermissionState: {
              on: {
                UPDATE_PERMISSION: [
                  {
                    target: 'PermissionState.Prompt',
                    cond: 'permissionStateIsPrompt',
                  },
                  {
                    target: 'PermissionState.Denied',
                    cond: 'permissionStateIsDenied',
                  },
                  {
                    target: 'PermissionState.Granted',
                    cond: 'permissionStateIsGranted',
                  },
                ],
              },
              initial: 'Uninitialized',
              states: {
                Uninitialized: {},
                Prompt: {},
                Denied: {},
                Granted: {},
                // on: {
                //   REGISTER_PUSH_SUBSCRIPTION: {
                //     target: 'Registered',
                //     actions: 'registerPushSubscriptions',
                // actions: (context, event) => {
                //   const { endpoint, keys } = event.json;
                //   assert(
                //     endpoint,
                //     'expected endpoint in push subscription payload'
                //   );
                //   assert(
                //     keys,
                //     'expected keys in push subscription payload'
                //   );
                //   assert('auth' in keys, "expetcted 'auth' in keys");
                //   assert('p256dh' in keys, "expected 'p256dh' in keys");
                //   const { auth, p256dh } = keys;
                //   const payload = '< Push Payload String >';
                //   const options = {
                //     vapidDetails: {
                //       subject: 'mailto:push@strikers.game',
                //       publicKey: configuration.PUBLIC_VAPID_PUBLIC_KEY,
                //       privateKey: configuration.VAPID_PRIVATE_KEY,
                //     },
                //     // timeout: <Number>
                //     // TTL: <Number>,
                //     // headers: {
                //     //   '< header name >': '< header value >'
                //     // },
                //     // contentEncoding: '< Encoding type, e.g.: aesgcm or aes128gcm >',
                //     // urgency:'< Default is "normal" >',
                //     // topic:'< Use a maximum of 32 characters from the URL or filename-safe Base64 characters sets. >',
                //     // proxy: '< proxy server options >',
                //     // agent: '< https.Agent instance >'
                //   };
                //   setTimeout(() => {
                //     webpush
                //       .sendNotification(
                //         {
                //           endpoint,
                //           keys: {
                //             auth,
                //             p256dh,
                //           },
                //         },
                //         payload,
                //         options
                //       )
                //       .then(noop);
                //   }, 5000);
                // },
                //   },
                // },
              },
            },

            // Uninitialized: {
            //   on: {
            //     REGISTER_PUSH_SUBSCRIPTION: {
            //       actions: (context, event) => {
            //         const { endpoint, keys } = event.json;
            //         assert(
            //           endpoint,
            //           'expected endpoint in push subscription payload'
            //         );
            //         assert(keys, 'expected keys in push subscription payload');
            //         assert('auth' in keys, "expetcted 'auth' in keys");
            //         assert('p256dh' in keys, "expected 'p256dh' in keys");
            //         const { auth, p256dh } = keys;

            //         const payload = '< Push Payload String >';

            //         const options = {
            //           vapidDetails: {
            //             subject: 'mailto:push@strikers.game',
            //             publicKey: configuration.PUBLIC_VAPID_PUBLIC_KEY,
            //             privateKey: configuration.VAPID_PRIVATE_KEY,
            //           },
            //           // timeout: <Number>
            //           // TTL: <Number>,
            //           // headers: {
            //           //   '< header name >': '< header value >'
            //           // },
            //           // contentEncoding: '< Encoding type, e.g.: aesgcm or aes128gcm >',
            //           // urgency:'< Default is "normal" >',
            //           // topic:'< Use a maximum of 32 characters from the URL or filename-safe Base64 characters sets. >',
            //           // proxy: '< proxy server options >',
            //           // agent: '< https.Agent instance >'
            //         };

            //         setTimeout(() => {
            //           webpush
            //             .sendNotification(
            //               {
            //                 endpoint,
            //                 keys: {
            //                   auth,
            //                   p256dh,
            //                 },
            //               },
            //               payload,
            //               options
            //             )
            //             .then(noop);
            //         }, 5000);
            //       },
            //     },
            //   },
            // },
            // Subscribed: {},
            // NoSupport: {},
            // Off: {},
          },
        },
      },
      predictableActionArguments: true,
    },
    {
      services: {
        connectToRoom: async () => {
          const url = new URL(connectionEntity.currentUrl);
          const slug = url.pathname.split('/')[1];
          assert(slug, 'error parsing slug from currentUrl');
          assertEntitySchema(sessionEntity, 'session');

          let roomEntity: RoomEntity | undefined = roomsBySlug.get(slug);
          if (!roomEntity) {
            roomEntity = createEntity<RoomEntity>({
              schema: 'room',
              slug,
              hostUserId: sessionEntity.userId,
              memberUserIds: [],
              connectedUserIds: [],
              gameId: 'strikers',
            }) as RoomEntity;
            world.add(roomEntity);
          }

          roomEntity.send({
            type: 'CONNECT',
            senderId: connectionEntity.id,
          } satisfies RoomCommand);

          const gameEntityId = roomEntity.currentGameInstanceId;
          const currentChannelId = gameEntityId ? gameEntityId : roomEntity.id;
          connectionEntity.currentChannelId = currentChannelId;
        },
      },
      guards: {
        permissionStateIsPrompt: (context, event) => {
          const { permission } = ConnectionUpdatePermissionSchema.parse(event);
          assertEventType(permission, 'NOTIFICATIONS');
          return permission.value === 'prompt';
        },
        permissionStateIsDenied: (context, event) => {
          const { permission } = ConnectionUpdatePermissionSchema.parse(event);
          assertEventType(permission, 'NOTIFICATIONS');
          return permission.value === 'denied';
        },
        permissionStateIsGranted: (context, event) => {
          const { permission } = ConnectionUpdatePermissionSchema.parse(event);
          assertEventType(permission, 'NOTIFICATIONS');
          return permission.value === 'granted';
        },
      },
      actions: {
        // registerPushSubscriptions: (context, event) => {
        //   const { json } =
        //     ConnectionRegisterPushSubscriptionCommandSchema.parse(event);
        //   const { endpoint, keys } = json;
        //   assert(endpoint, 'expected endpoint in push subscription payload');
        //   assert(keys, 'expected keys in push subscription payload');
        //   assert('auth' in keys, "expetcted 'auth' in keys");
        //   assert('p256dh' in keys, "expected 'p256dh' in keys");
        //   const { auth, p256dh } = keys;

        //   assert(userEntity, 'expected userEntity');

        //   context.pushSubscription = {
        //     keys: {
        //       auth,
        //       p256dh,
        //     },
        //     endpoint,
        //   };
        // },
        setCurrentLocation: (_, event) => {
          const parsedEvent = SetCurrentLocationEventSchema.parse(event);
          const route =
            parsedEvent.type === 'INITIALIZE'
              ? parsedEvent.initialRouteProps
              : parsedEvent.route;

          // TODO might need to prepend full path ehre
          switch (route.name) {
            case 'Home':
              connectionEntity.currentUrl = '/';
              break;
            case 'Login':
              connectionEntity.currentUrl = '/login';
              break;
            case 'New':
              connectionEntity.currentUrl = '/new';
              break;
            case 'Room':
              connectionEntity.currentUrl = `/${route.roomSlug}`;
              break;
            default:
              connectionEntity.currentUrl = '/not-found';
              break;
          }
        },
        // initializeCurrentRoom: (_, event) => {
        //   assertEventType(event, 'INITIALIZE');

        //   // if (event.initialRouteProps.name == 'Room') {
        //   //   // connectionEntity.currentRoomSlug = event.initialRouteProps.roomSlug;
        //   //   const roomEntity = roomsBySlug.get(
        //   //     event.initialRouteProps.roomSlug
        //   //   );
        //   //   assert(
        //   //     roomEntity && roomEntity.schema === 'room',
        //   //     "expected room entity but couldn't find"
        //   //   );
        //   //   connectionEntity.currentChannelId = roomEntity.id;
        //   // }
        // },
      },
    }
  );
  return connectionMachine;
};

const SetCurrentLocationEventSchema = z.union([
  ConnectionInitializeCommandSchema,
  ConnectionNavigateCommandSchema,
]);
