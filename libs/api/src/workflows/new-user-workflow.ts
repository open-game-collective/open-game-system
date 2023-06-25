import { createMachine } from 'xstate';

export const NewUserWorkflow = createMachine({
  id: 'NewUserWorkflow',
  initial: 'Hello',
  states: {
    Hello: {
      after: {
        3000: 'Going',
      },
    },
    Going: {
      after: {
        1000: 'Done',
      },
    },
    Done: {
      type: 'final',
    },
  },
});