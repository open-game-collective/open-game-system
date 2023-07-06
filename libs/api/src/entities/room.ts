import type {
  ConnectEvent,
  DisconnectEvent,
  WithSenderId,
} from '@explorers-club/schema';
import {
  CreateEventProps,
  Entity,
  RoomCommand,
  RoomContext,
  RoomEvent,
  StrikersGameEntity,
  StrikersPlayerEntity,
} from '@explorers-club/schema';
import { assertEntitySchema } from '@explorers-club/utils';
import { createStrikersGame } from '@strikers/server';
import { World } from 'miniplex';
import { ReplaySubject } from 'rxjs';
import { createMachine } from 'xstate';
import { createEntity } from '../ecs';
import { generateSnowflakeId } from '../ids';
import { entitiesById } from '../server/state';
import { assert } from 'console';
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

  return createMachine({
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
          console.log(event);
          const connectionEntity = entitiesById.get(event.senderId);
          assertEntitySchema(connectionEntity, 'connection');

          const { sessionId } = connectionEntity;

          if (!roomEntity.allSessionIds.includes(sessionId)) {
            roomEntity.allSessionIds = [...roomEntity.allSessionIds, sessionId];

            // todo: some new joined the room, log a message
            // by sending a message ot the channel

            // roomChannel.next({
            //   type: 'CONNECT',
            //   subjectId: event.senderId,
            // } as CreateEventProps<ConnectEvent>);
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

          roomChannel.next({
            type: 'DISCONNECT',
            subjectId: event.senderId,
          } as CreateEventProps<DisconnectEvent>);
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
                // event.
                // how do I get who is p1 and who is p2
                // const p1 = createEntity<StrikersPlayerEntity>({
                //   schema: 'strikers_player',
                //   userId: '',
                //   gameEntityId: '',
                //   channel: undefined
                // });
                // const p2 = createEntity<StrikersPlayerEntity>({
                //   schema: 'strikers_player',
                //   userId: '',
                //   gameEntityId: '',
                //   channel: undefined
                // });

                // roomEntity.zEQWWWW
                // roomEntity.configuration

                // switch (roomEntity.configuration.) {

                // }
                let gameEntity: Entity;
                assert(
                  roomEntity.currentGameConfiguration,
                  'expected game configuration but was null'
                );

                switch (roomEntity.gameId) {
                  case 'strikers':
                    gameEntity = createStrikersGame(roomEntity.id);
                    break;
                  default:
                    throw new Error(
                      'unimplemented gameId: ' + roomEntity.gameId
                    );
                }

                entity.currentGameInstanceId = gameEntity.id;
              },
              onDone: 'Started',
              onError: 'Error',
            },
          },
          Error: {},
          Started: {},
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
  });
};
