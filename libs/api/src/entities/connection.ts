import {
  ConnectionCommand,
  ConnectionContext,
  Entity,
  // InitializedConnectionContext,
  NewRoomContext,
  RoomEntity,
  SessionEntity,
  WithSenderId,
} from '@explorers-club/schema';
import type { RoomCommand, SessionCommand } from '@schema/types';
import { assert, assertEventType } from '@explorers-club/utils';
import {
  ConnectionInitializeCommandSchema,
  ConnectionNavigateCommandSchema,
} from '@schema/lib/connection';
import {
  HomeRoutePropsSchema,
  LoginRoutePropsSchema,
  NewRoomRoutePropsSchema,
  RoomRoutePropsSchema,
} from '@schema/common';
import * as jwt from 'jsonwebtoken';
import { World } from 'miniplex';
import { DoneInvokeEvent, assign, createMachine, spawn } from 'xstate';
// import { createEntity } from '../ecs';
import { z } from 'zod';
import { createEntity } from '../ecs';
import { roomsBySlug } from '../server/indexes';
import { newRoomMachine } from '../services';
import { createChatMachine } from '../services/chat.service';
import { entitiesById } from '../server/state';

// const supabaseUrl = process.env['SUPABASE_URL'];
// const supabaseJwtSecret = process.env['SUPABASE_JWT_SECRET'];
// const supabaseAnonKey = process.env['SUPABASE_ANON_KEY'];
// const supabaseServiceKey = process.env['SUPABASE_SERVICE_KEY'];

// todo: switch to using zod for parsing
// if (
//   !supabaseUrl ||
//   !supabaseJwtSecret ||
//   !supabaseAnonKey ||
//   !supabaseServiceKey
// ) {
//   throw new Error('missing supabase configuration');
// }

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

  let sessionEntity = entitiesById.get(connectionEntity.sessionId);
  if (sessionEntity) {
    assert(
      sessionEntity.schema === 'session',
      'expected sessionEntity to be of schema session but was ' +
        sessionEntity.schema
    );
    sessionEntity.send({
      type: 'NEW_CONNECTION',
      connectionId: connectionEntity.id,
    } as SessionCommand);
  } else {
    console.log(
      'creating',
      connectionEntity.sessionId,
      'on',
      connectionEntity.id
    );
    sessionEntity = createEntity<SessionEntity>({
      id: connectionEntity.sessionId,
      schema: 'session',
      connectionIds: [connectionEntity.id],
    });
    world.add(sessionEntity);
  }

  // todo put db client init here
  // const supabaseClient = createClient<Database>(
  //   supabaseUrl,
  //   supabaseAnonKey,
  //   {
  //     auth: {
  //       persistSession: false,
  //     },
  //   }
  // );

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
        // supabaseClient: undefined,
        reconnectCount: -1,
        chatServiceRef: undefined,
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
                  NewRoomRoutePropsSchema.safeParse(event.route).success,
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
                    assert(
                      sessionEntity,
                      'expected sessionEntity but not found'
                    );

                    const { gameId, roomSlug } = event.data;

                    const entity = createEntity<RoomEntity>({
                      schema: 'room',
                      slug: roomSlug,
                      hostSessionId: connectionEntity.id,
                      allSessionIds: [],
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
                Error: {},
                Initialized: {
                  entry: ['spawnChatService'],
                },
              },
            },
          },
        },
        Initialized: {
          initial: 'Initializing',
          states: {
            Error: {},
            Initializing: {
              invoke: {
                onError: {
                  target: 'Error',
                  actions: (_, event) => {
                    console.warn(event);
                  },
                },
                onDone: {
                  target: 'True',
                  // actions: assignImmer<
                  //   ConnectionContext,
                  //   DoneInvokeEvent<InitializedConnectionContext>
                  // >((context, { data }) => {
                  //   // context.location = data.location;
                  //   // context.deviceId = data.deviceId;
                  //   context.supabaseClient = data.supabaseClient;
                  // }),
                },
                src: async (context, event) => {
                  // assertEventType(event, 'INITIALIZE');
                  // any further async initializaiton here...
                  // let supabaseSession: Session;
                  // // If returning user, get session
                  // if (authTokens) {
                  //   const { data, error } =
                  //     await supabaseClient.auth.setSession({
                  //       access_token: authTokens.accessToken,
                  //       refresh_token: authTokens.refreshToken,
                  //     });
                  //   if (error) {
                  //     throw new TRPCError({
                  //       code: 'INTERNAL_SERVER_ERROR',
                  //       message: error.message,
                  //       cause: error,
                  //     });
                  //   }
                  //   if (!data.session) {
                  //     throw new TRPCError({
                  //       code: 'UNAUTHORIZED',
                  //       message:
                  //         'Not able to get supabase session with authTokens',
                  //     });
                  //   }
                  //   supabaseSession = data.session;
                  // } else {
                  //   // Create the user if not exists
                  //   const { data, error } = await supabaseClient.auth.signUp({
                  //     email: `anon-${generateRandomString()}@explorers.club`,
                  //     password: `${generateRandomString()}33330`,
                  //   });
                  //   if (error) {
                  //     throw new TRPCError({
                  //       code: 'INTERNAL_SERVER_ERROR',
                  //       message: error.message,
                  //       cause: error,
                  //     });
                  //   }
                  //   if (!data.session) {
                  //     throw new TRPCError({
                  //       code: 'INTERNAL_SERVER_ERROR',
                  //       message: 'Expected session but was missing',
                  //     });
                  //   }
                  //   supabaseSession = data.session;
                  //   await supabaseClient.auth.setSession({
                  //     access_token: data.session.access_token,
                  //     refresh_token: data.session.refresh_token,
                  //   });
                  //   // Create user entity if doesn't already exist
                  //   const userEntity = usersById.get(supabaseSession.user.id);
                  //   if (!userEntity) {
                  //     const START_NUMBER = 1000; // fake for now, use real db number later
                  //     const serialNumber = START_NUMBER + usersById.size + 1;
                  //     const userEntity = createEntity<UserEntity>({
                  //       serialNumber,
                  //       schema: 'user',
                  //       discriminator: serialNumber,
                  //       name: 'Miner',
                  //     });
                  //     world.add(userEntity);
                  //     // sessionEntity.userId = userEntity.id;
                  //   }
                  // }
                  // const userId = supabaseSession.user.id;
                  // sessionEntity = sessionsByUserId.get(userId) as
                  //   | SessionEntity
                  //   | undefined;
                  // // If session exists set it on the connection
                  // if (sessionEntity) {
                  //   world.addComponent(
                  //     connectionEntity,
                  //     'sessionId',
                  //     sessionEntity.id
                  //   );
                  // } else {
                  //   // Otherwise make a new session
                  //   sessionEntity = createEntity<SessionEntity>({
                  //     schema: 'session',
                  //     userId,
                  //     name: 'Miner #48572',
                  //   });
                  //   // add the session Id to the connection
                  //   world.addComponent(
                  //     connectionEntity,
                  //     'sessionId',
                  //     sessionEntity.id
                  //   );
                  //   world.add(sessionEntity);
                  // }
                  // const deviceId = event.deviceId || generateSnowflakeId();
                  // Do I need to use addComponent
                  // connectionEntity.deviceId = deviceId;
                  // connectionEntity.accessToken = accessToken
                  // connectionEntity.authTokens = {
                  //   accessToken: supabaseSession.access_token,
                  //   refreshToken: supabaseSession.refresh_token,
                  // };
                  // return {
                  //   chatServiceRef
                  // } satisfies InitializedConnectionContext;
                },
              },
            },
            True: {},
          },
        },
        Connected: {
          initial: 'No',
          states: {
            No: {
              on: {
                CONNECT: {
                  target: 'Yes',
                  actions: assign({
                    reconnectCount: ({ reconnectCount }) => reconnectCount + 1,
                  }),
                },
              },
            },
            Yes: {
              on: {
                DISCONNECT: 'No',
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
            Error: {},
            Denied: {},
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

          let roomEntity = roomsBySlug.get(slug);
          if (!roomEntity) {
            roomEntity = createEntity<RoomEntity>({
              schema: 'room',
              slug,
              hostSessionId: connectionEntity.sessionId,
              allSessionIds: [],
              gameId: 'strikers',
            });
            world.add(roomEntity);
          }

          roomEntity.send({
            type: 'CONNECT',
            senderId: connectionEntity.id,
          } satisfies RoomCommand);

          connectionEntity.currentChannelId = roomEntity.id;
          connectionEntity.allChannelIds = [
            ...connectionEntity.allChannelIds,
            roomEntity.id,
          ];
        },
      },
      actions: {
        // joinCurrentChannel: async (context) => {
        //   const { createEntity } = await import('../ecs');
        //   assert(
        //     context.chatServiceRef,
        //     'expected chat service to be initialized'
        //   );
        //   assert(
        //     connectionEntity.currentChannelId,
        //     'expected current channel id but not found'
        //   );

        //   let roomEntity = entitiesById.get(
        //     connectionEntity.currentChannelId
        //   ) as RoomEntity;

        //   console.log('CREATRINGROOOM!', connectionEntity.currentLocation);

        //   // Create the room if one doesnt already exist

        //   // Connect to it
        //   roomEntity.send({
        //     type: 'CONNECT',
        //     senderId: connectionEntity.id,
        //   } as any);

        //   // todo fix types on senderId, it doesnt konw it exists, only in machine
        //   // problem for sending commands outside entity router send mutation

        //   // Join the chat room
        //   // todo: is this still used? or just use message_channel entity now
        //   context.chatServiceRef.send({
        //     type: 'JOIN_CHANNEL',
        //     channelId: roomEntity.id,
        //   });

        //   // Join the game room if there is one
        //   // if (roomEntity.gameId) {
        //   //   context.chatServiceRef.send({
        //   //     type: 'JOIN_CHANNEL',
        //   //     channelId: roomEntity.gameId,
        //   //   });
        //   // }

        //   // todo clean up ref
        //   // wasnt able to get assign on entry to be called so gave up
        //   // spawn(
        //   //   chatMachine.withContext({
        //   //     roomSlug: connectionEntity.currentRoomSlug,
        //   //   }),
        //   //   'chatService'
        //   // );
        //   // chatService.join()
        // },
        spawnChatService: assign({
          chatServiceRef: () =>
            spawn(
              createChatMachine({ connectionEntity }),
              'chatService'
            ) as ConnectionContext['chatServiceRef'],
        }),

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
            case 'NewRoom':
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
