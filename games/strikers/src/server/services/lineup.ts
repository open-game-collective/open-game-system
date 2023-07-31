import { LineupCommand, LineupContext } from '@schema/games/strikers';
import { createMachine } from 'xstate';

export const lineupMachine = createMachine({
  id: 'LineupMachine',
  initial: 'SendMessages',
  schema: {
    events: {} as LineupCommand,
    context: {} as LineupContext,
  },
  states: {
    SendMessages: {
      entry: () => {
        console.log('sending message');
      },
    },
    WaitingForInput: {
      on: {
        SELECT_FORMATION: {
          actions: () => {
            console.log(event);
          },
        },
      },
      onDone: 'Complete',
    },
    Complete: {
      data: (context) => context,
      type: 'final',
    },
  },
});
