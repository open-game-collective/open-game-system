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
import { assert } from '@explorers-club/utils';
import { createStrikersGame } from '@strikers/server';
import { World } from 'miniplex';
import { ReplaySubject } from 'rxjs';
import { createMachine } from 'xstate';
import { createEntity } from '../ecs';
import { generateSnowflakeId } from '../ids';
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
  assert(entity.schema === 'room', 'expected room schema when creating room');
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
          console.log('CONNECTING!', event);
          // const connectionEntity = (await waitForCondition<ConnectionEntity>(
          //   world,
          //   entitiesById,
          //   event.senderId,
          //   (entity) => entity.states.Initialized === 'True'
          // )) as InitializedConnectionEntity;
          if (!roomEntity.connectedEntityIds.includes(event.senderId)) {
            roomEntity.connectedEntityIds = [
              ...roomEntity.connectedEntityIds,
              event.senderId,
            ];

            roomChannel.next({
              type: 'CONNECT',
              subjectId: event.senderId,
            } as CreateEventProps<ConnectEvent>);
            console.log('CONNECTED!');
          }
        },
      },
      DISCONNECT: {
        actions: async (_, event) => {
          console.log('DISCONNECTING!', event);
          roomEntity.connectedEntityIds = [
            ...roomEntity.connectedEntityIds.filter(
              (id) => id !== event.senderId
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
                target: 'Started',
                actions: async (context, event) => {
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
                  switch (roomEntity.gameId) {
                    case 'strikers':
                      gameEntity = createStrikersGame(roomEntity.configuration);
                      break;
                    default:
                      throw new Error(
                        'unimplemented gameId: ' + roomEntity.gameId
                      );
                  }

                  entity.currentGameInstanceId = gameEntity.id;
                },
              },
            },
          },
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
