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
            const userEntity = entitiesById.get(userId);
            assertEntitySchema(userEntity, 'user');

            userEntity.send({
              type: 'ENTER_CHANNEL',
              channelId: roomEntity.id,
            });

            // listen for when there is a game on the room, if one comes, add it as a channel for them
            // todo save sub on context, clean up on disconnect
            const sub = roomEntity.subscribe((event) => {
              if (
                roomEntity.currentGameInstanceId &&
                !userEntity.chatService?.context.channelEntityIds[
                  roomEntity.currentGameInstanceId
                ]
              ) {
                // should happen only once but has potential to be called a bunch
                // if userEntity doesnt update channelId immedaitely
                userEntity.send({
                  type: 'ENTER_CHANNEL',
                  channelId: roomEntity.currentGameInstanceId,
                });
              }
              // todo add LEAVE_CHANNEL here too ?
            });

            const alreadyMember = roomEntity.memberUserIds.includes(userId);

            // Add new member to the room
            // Default allow all new ppl to join for now
            if (!alreadyMember) {
              roomEntity.memberUserIds = [...roomEntity.memberUserIds, userId];

              // Send a join message to the channel
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

              // Send a pinned "start game" message to the first person who
              // joins to give them control to start a game
              if (roomEntity.memberUserIds.length === 1) {
                const startGameMessage = {
                  type: 'MESSAGE',
                  senderId: roomEntity.id,
                  recipientId: userId,
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

            // Connect user to the room
            if (!roomEntity.connectedUserIds.includes(userId)) {
              roomEntity.connectedUserIds = [
                ...roomEntity.connectedUserIds,
                userId,
              ];

              // Send a connected message to the channel
              // Only send it if we didnt just send the join message
              if (alreadyMember) {
                const connectMessage = {
                  type: 'MESSAGE',
                  senderId: roomEntity.id,
                  contents: [
                    {
                      type: 'UserConnected',
                      userId: sessionEntity.userId,
                      timestamp: new Date().toString(),
                    },
                  ],
                } satisfies CreateEventProps<RoomMessageEvent>;
                roomChannel.next(connectMessage);
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

            roomEntity.connectedUserIds = [
              ...roomEntity.connectedUserIds.filter((id) => id !== userId),
            ];

            const disconnectEvent = {
              type: 'MESSAGE',
              senderId: roomEntity.id,
              contents: [
                {
                  type: 'UserDisconnected',
                  userId: 'foobar',
                  timestamp: new Date().toString(),
                },
              ],
            } satisfies CreateEventProps<RoomMessageEvent>;
            roomChannel.next(disconnectEvent);
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
                    p1UserId: roomEntity.memberUserIds[0],
                    p2UserId: roomEntity.memberUserIds[1],
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
