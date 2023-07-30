import { LineupCommand, LineupContext } from '@schema/games/strikers';
import { createMachine } from 'xstate';

export const lineupMachine = createMachine({
  id: 'LineupMachine',
  initial: 'WaitingForInput',
  schema: {
    events: {} as LineupCommand,
    context: {} as LineupContext,
  },
  states: {
    WaitingForInput: {
      onDone: 'Complete',
    },
    Complete: {
      data: (context) => context,
      type: 'final',
    },
  },
});
