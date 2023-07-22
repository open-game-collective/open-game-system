import type {
  LobbyGameConfig,
  RoomMessageEvent,
  WithSenderId,
} from '@explorers-club/schema';
import {
  CreateEventProps,
  Entity,
  RoomCommand,
  RoomContext,
  RoomEvent,
} from '@explorers-club/schema';
import { assertEntitySchema } from '@explorers-club/utils';
import { createStrikersGame } from '@strikers/server';
import { World } from 'miniplex';
import { ReplaySubject } from 'rxjs';
import { createMachine } from 'xstate';
import { entitiesById } from '../server/state';
// import { generateSnowflakeId } from '../ids';

export const createRoomMachine = ({
  world,
  entity,
  channel,
}: {
  world: World;
  entity: Entity;
  channel: ReplaySubject<any>;
}) => {
  assertEntitySchema(entity, 'room');
  const roomEntity = entity;
  const roomChannel = channel as ReplaySubject<CreateEventProps<RoomEvent>>;

  return createMachine(
    {
      id: 'RoomMachine',
      type: 'parallel',
      // context: {
      //   workflows: new Map(),
      // },
      schema: {
        context: {} as RoomContext,
        events: {} as WithSenderId<RoomCommand>,
      },
      on: {
        CONNECT: {
          actions: async (_, event) => {
            const connectionEntity = entitiesById.get(event.senderId);
            assertEntitySchema(connectionEntity, 'connection');

            const { sessionId } = connectionEntity;
            const sessionEntity = entitiesById.get(sessionId);
            assertEntitySchema(sessionEntity, 'session');

            const { userId } = sessionEntity;

            /**
             * If this is person first time here, send join
             */
            if (!roomEntity.allUserIds.includes(userId)) {
              roomEntity.allUserIds = [...roomEntity.allUserIds, userId];

              const joinMessage = {
                type: 'MESSAGE',
                senderId: roomEntity.id,
                contents: [
                  {
                    type: 'UserJoined',
                    userId: sessionEntity.userId,
                    slug: `#${roomEntity.slug}`,
                    timestamp: new Date().toString(),
                  },
                ],
              } satisfies CreateEventProps<RoomMessageEvent>;
              roomChannel.next(joinMessage);

              if (roomEntity.allUserIds.length === 1) {
                // Should the recipient by a session or a userId?
                // Probably a userId
                // but this is fine for now

                const recipientEntity = entitiesById.get(
                  roomEntity.allUserIds[0]
                );
                assertEntitySchema(recipientEntity, 'user');

                const startGameMessage = {
                  type: 'MESSAGE',
                  senderId: roomEntity.id,
                  recipientId: recipientEntity.id,
                  contents: [
                    {
                      type: 'StartGame',
                      gameId: 'strikers',
                      timestamp: new Date().toString(),
                    },
                  ],
                } satisfies CreateEventProps<RoomMessageEvent>;
                roomChannel.next(startGameMessage);
              }
            }
          },
        },
        DISCONNECT: {
          actions: async (_, event) => {
            const connectionEntity = entitiesById.get(event.senderId);
            assertEntitySchema(connectionEntity, 'connection');
            const sessionEntity = entitiesById.get(connectionEntity.sessionId);
            assertEntitySchema(sessionEntity, 'session');
            const { userId } = sessionEntity;

            roomEntity.allUserIds = [
              ...roomEntity.allUserIds.filter((id) => id !== userId),
            ];

            const disconnectEvent = {
              type: 'MESSAGE',
              senderId: roomEntity.id,
              contents: [
                {
                  type: 'PlayerDisconnected',
                  playerId: 'foobar',
                  username: 'foobar2',
                  timestamp: new Date().toString(),
                  // props: {
                  //   playerId: 'foo',
                  //   username: 'foobar',
                  //   timestamp: 'hello',
                  // },
                },
              ],
            } satisfies CreateEventProps<RoomMessageEvent>;
            roomChannel.next(disconnectEvent);

            // roomChannel.next({
            //   type: 'M',
            //   subjectId: event.senderId,
            // } as CreateEventProps<DisconnectEvent>);
          },
        },
      },
      states: {
        Scene: {
          initial: 'Lobby',
          states: {
            Lobby: {},
            Loading: {},
            Game: {},
          },
        },
        Game: {
          initial: 'WaitingToStart',
          states: {
            WaitingToStart: {
              on: {
                START: {
                  target: 'Starting',
                },
              },
            },
            Starting: {
              invoke: {
                src: async (context, event) => {
                  const lobbyGameConfig = {
                    p1UserId: roomEntity.allUserIds[0],
                    p2UserId: roomEntity.allUserIds[1],
                  } satisfies LobbyGameConfig;

                  let gameEntity: Entity;
                  switch (roomEntity.gameId) {
                    case 'strikers':
                      gameEntity = createStrikersGame(
                        roomEntity.id,
                        lobbyGameConfig
                      );
                      break;
                    default:
                      throw new Error(
                        'unimplemented gameId: ' + roomEntity.gameId
                      );
                  }

                  entity.currentGameInstanceId = gameEntity.id;
                },
                onDone: 'Started',
                onError: {
                  target: 'Error',
                  actions: 'logEventError',
                },
              },
            },
            Error: {},
            Started: {
              // todo listen for game done here...
            },
          },
        },
        Active: {
          initial: 'No',
          states: {
            No: {},
            Yes: {},
          },
        },
      },
    },
    {
      actions: {
        logEventError: (_, event) => {
          console.error(event);
        },
      },
    }
  );
};
