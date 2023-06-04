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
          if (!roomEntity.connectedEntityIds.length) {
            roomEntity.connectedEntityIds.push(event.connectionEntityId);
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
