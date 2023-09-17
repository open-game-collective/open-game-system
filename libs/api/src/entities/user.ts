import { createEntity } from '@api/ecs';
import { createChatMachine } from '@api/services/chat.service';
import {
  ConnectionEntity,
  Entity,
  NotificationPayload,
  StreamEntity,
  UserCommand,
  UserContext,
  WithSenderId,
} from '@explorers-club/schema';
import {
  assert,
  assertEntitySchema,
  assertEventType,
} from '@explorers-club/utils';
import { faker } from '@faker-js/faker';
import {
  DevicePushSubscription,
  DevicePushSubscriptionSchema,
} from '@schema/lib/user';
import * as jwt from 'jsonwebtoken';
import { World } from 'miniplex';
import * as webpush from 'web-push';
import { assign, createMachine, spawn } from 'xstate';
import { z } from 'zod';
import { entitiesById, generateSnowflakeId } from '..';

const configurationSchema = z.object({
  PUBLIC_STRIKERS_GAME_WEB_URL: z.string(),
  PUBLIC_VAPID_PUBLIC_KEY: z.string(),
  VAPID_PRIVATE_KEY: z.string(),
});

const {
  PUBLIC_STRIKERS_GAME_WEB_URL,
  PUBLIC_VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
} = configurationSchema.parse(process.env);

export const createUserMachine = ({
  world,
  entity,
}: {
  world: World;
  entity: Entity;
}) => {
  assertEntitySchema(entity, 'user');
  // const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  //   auth: {
  //     persistSession: false,
  //   },
  // });

  const userMachine = createMachine(
    {
      id: 'UserMachine',
      type: 'parallel',
      schema: {
        context: {} as UserContext,
        events: {} as WithSenderId<UserCommand>, // warning sendinerId not present for initialize
      },
      on: {
        CREATE_STREAM: {
          actions: (_, { roomId, senderId }) => {
            const connectionEntity = entitiesById.get(senderId);
            assertEntitySchema(connectionEntity, 'connection');

            const roomEntity = entitiesById.get(roomId);
            assertEntitySchema(roomEntity, 'room');

            if (!entity.name) {
              // just choose a name
              // todo assert that user has one here instead
              entity.name = faker.person.firstName();
            }

            const streamId = generateSnowflakeId();
            const url = `${PUBLIC_STRIKERS_GAME_WEB_URL}/${roomEntity.slug}`;

            const token = jwt.sign(
              {
                url,
                streamId,
                hostSessionId: connectionEntity.sessionId,
              },
              'my_private_key',
              {
                subject: streamId,
                expiresIn: '30d',
              }
            );

            const streamEntity = createEntity<StreamEntity>({
              id: streamId,
              schema: 'stream',
              hostId: entity.id,
              roomId,
              token,
            });
            world.add(streamEntity);
            entity.streamIds = [...entity.streamIds, streamId];
          },
        },
        DISCONNECT: {
          actions: (context, event) => {
            console.log('dc user', event);
          },
        },
        CONNECT: {
          actions: (context, event) => {
            console.log('connect user', event);
          },
        },
      },
      context: {
        chatServiceRef: undefined,
        pushSubscriptions: [],
      },
      states: {
        Push: {
          initial: 'Uninitialized',
          states: {
            Uninitialized: {
              on: {
                REGISTER_PUSH_SUBSCRIPTION: {
                  target: 'Registering',
                  // actions: 'assignPushSubscription',
                },
              },
            },
            Registering: {
              invoke: {
                src: 'registerPushSubscription',
                onDone: {
                  target: 'Enabled',
                  actions: (context, event) => {
                    console.log({ event });
                    const subscription = DevicePushSubscriptionSchema.parse(
                      event.data
                    );
                    context.pushSubscriptions = [
                      ...context.pushSubscriptions,
                      subscription,
                    ];
                  },
                },
                onError: 'Error',
              },
            },
            Error: {
              always: [
                {
                  target: 'Enabled',
                  cond: 'hasActivePushSubscriptions',
                },
                {
                  target: 'Uninitialized',
                },
              ],
            },
            Enabled: {},
          },
        },
        Chat: {
          initial: 'Running',
          entry: assign({
            chatServiceRef: () => {
              return spawn(createChatMachine({ userEntity: entity }), {
                name: 'chatService',
                autoForward: true,
              }) as UserContext['chatServiceRef'];
            },
          }),
          states: {
            Running: {},
          },
        },
        Initialized: {
          initial: 'No',
          states: {
            Yes: {},
            No: {},
          },
        },
      },
    },
    {
      actions: {
        // assignPushSubscription: assignImmer((context, event) => {
        //   const connectionEntity = entitiesById.get(event.senderId);
        //   assertEntitySchema(connectionEntity, 'connection');
        //   assertEventType(event, 'REGISTER_PUSH_SUBSCRIPTION');
        //   entitiesById.get(event.senderId);
        //   const { endpoint, keys, expirationTime } = event.json;
        //   assert(endpoint, 'expected endpoint in push subscription payload');
        //   assert(keys, 'expected keys in push subscription payload');
        //   assert('auth' in keys, "expetcted 'auth' in keys");
        //   assert('p256dh' in keys, "expected 'p256dh' in keys");
        //   const { auth, p256dh } = keys;
        //   const { deviceId } = connectionEntity;
        //   context.pushSubscriptionsByDeviceId = {
        //     [deviceId]: {
        //       endpoint,
        //       keys: {
        //         p256dh,
        //         auth,
        //       },
        //       expirationTime,
        //       addedAt: new Date().getTime(),
        //     },
        //   };
        // }),
      },
      guards: {
        hasActivePushSubscriptions: (context, event) => {
          return context.pushSubscriptions.length > 0;
        },
      },
      services: {
        registerPushSubscription: async (context, event) => {
          const connectionEntity = entitiesById.get(event.senderId) as
            | ConnectionEntity
            | undefined;
          assert(connectionEntity, 'expected connecitonEntity');
          // Send a test push to make sure it works
          assertEventType(event, 'REGISTER_PUSH_SUBSCRIPTION');

          const { endpoint, keys, expirationTime } = event.json;
          assert(endpoint, 'expected endpoint in push subscription payload');
          assert(keys, 'expected keys in push subscription payload');
          assert('auth' in keys, "expetcted 'auth' in keys");
          assert('p256dh' in keys, "expected 'p256dh' in keys");
          const { deviceId } = connectionEntity;
          const { auth, p256dh } = keys;

          const payload = JSON.stringify({
            title: 'Notifications Activated',
          } satisfies NotificationPayload);
          const options = {
            vapidDetails: {
              subject: 'mailto:push@strikers.game',
              publicKey: PUBLIC_VAPID_PUBLIC_KEY,
              privateKey: VAPID_PRIVATE_KEY,
            },
          };

          const devicePushSubscription = {
            deviceId,
            endpoint,
            expirationTime,
            addedAt: new Date().getTime(),
            keys: {
              auth,
              p256dh,
            },
          } satisfies DevicePushSubscription;

          // Send the test push
          await webpush.sendNotification(
            {
              endpoint,
              keys: {
                auth,
                p256dh,
              },
            },
            payload,
            options
          );

          return devicePushSubscription;
        },
      },
    }
  );
  return userMachine;
};
