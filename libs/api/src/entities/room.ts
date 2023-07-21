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

            /**
             * If this is person first time here, send join
             */
            if (!roomEntity.allSessionIds.includes(sessionId)) {
              roomEntity.allSessionIds = [
                ...roomEntity.allSessionIds,
                sessionId,
              ];

              const joinMessage = {
                type: 'MESSAGE',
                senderId: roomEntity.id,
                contents: [
                  {
                    type: 'UserJoined',
                    avatarId: 'foo',
                    username: 'foobar',
                    slug: `#${roomEntity.slug}`,
                    timestamp: new Date().toString(),
                  },
                ],
              } satisfies CreateEventProps<RoomMessageEvent>;
              roomChannel.next(joinMessage);

              if (roomEntity.allSessionIds.length === 1) {
                // Should the recipient by a session or a userId?
                // Probably a userId
                // but this is fine for now

                const recipientSession = entitiesById.get(
                  roomEntity.allSessionIds[0]
                );
                assertEntitySchema(recipientSession, 'session');

                const startGameMessage = {
                  type: 'MESSAGE',
                  senderId: roomEntity.id,
                  recipientId: recipientSession.userId,
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

            roomEntity.allSessionIds = [
              ...roomEntity.allSessionIds.filter(
                (id) => id !== connectionEntity.sessionId
              ),
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
                  // const currentGameConfiguration: StrikersGameConfigData = {
                  //   cards: [],
                  //   gameMode: 'quickplay',
                  //   turnsPerHalf: 0,
                  //   p1SessionId: roomEntity.allSessionIds[0],
                  //   p2SessionId: roomEntity.allSessionIds[1],
                  //   extraTime: {
                  //     minRounds: 2,
                  //     maxRounds: 6,
                  //   },
                  // };
                  // roomEntity.currentGameConfiguration =
                  //   currentGameConfiguration;

                  const lobbyGameConfig = {
                    p1SessionId: roomEntity.allSessionIds[0],
                    p2SessionId: roomEntity.allSessionIds[1],
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
