import { NewRoomCommand, NewRoomContext, RoomEntity } from '@explorers-club/schema';
import { assign, createMachine } from 'xstate';
import { createEntity } from '../ecs';

export const newRoomMachine = createMachine({
  id: 'NewRoomMachine',
  initial: 'SelectGame',
  context: {
    gameId: undefined,
    gameConfiguration: undefined,
    roomSlug: undefined,
  },
  schema: {
    events: {} as NewRoomCommand,
    context: {} as NewRoomContext,
  },
  states: {
    SelectGame: {
      on: {
        SELECT_GAME: {
          target: 'Configure',
          actions: assign({
            gameId: (_, event) => event.gameId,
          }),
        },
      },
    },
    Configure: {
      on: {
        CONFIGURE_GAME: {
          target: 'EnterName',
          actions: assign({
            gameConfiguration: (_, event) => event.configuration,
          }),
        },
      },
    },
    EnterName: {
      on: {
        SUBMIT_NAME: {
          target: 'Complete',
          actions: assign({
            roomSlug: (_, event) => event.name,
          }),
        },
      },
    },
    Complete: {
      data: (context) => context,
      type: 'final',
    },
  },
});
