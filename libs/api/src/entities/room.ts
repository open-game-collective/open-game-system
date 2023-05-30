import { Entity, RoomCommand, RoomContext } from '@explorers-club/schema';
import { createMachine } from 'xstate';
import { World } from 'miniplex';

export const createRoomMachine = ({
  world,
}: {
  world: World;
  entity: Entity;
}) => {
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
          console.log(event);
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
