import {
  Entity,
  RoomCommand,
  RoomContext,
  RoomEntity,
} from '@explorers-club/schema';
import { createMachine } from 'xstate';
import { World } from 'miniplex';

export const createRoomMachine = ({
  world,
  entity,
}: {
  world: World;
  entity: Entity;
}) => {
  const roomEntity = entity as RoomEntity;

  return createMachine({
    id: 'RoomMachine',
    type: 'parallel',
    schema: {
      context: {} as RoomContext,
      events: {} as RoomCommand,
    },
    on: {
      CONNECT: {
        actions: (_, event) => {
          if (
            !roomEntity.connectedEntityIds.includes(event.connectionEntityId)
          ) {
            roomEntity.connectedEntityIds = [
              ...roomEntity.connectedEntityIds,
              event.connectionEntityId,
            ];

            roomEntity.channel.next({
              type: 'PLAIN',
              content: `${event.connectionEntityId} has connected.`,
            });
          }
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
