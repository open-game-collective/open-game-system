import { createMachine } from 'xstate';

export const NewUserWorkflow = createMachine({
  id: 'NewUserWorkflow',
  initial: 'Hello',
  states: {
    Hello: {
      after: {
        3000: 'Sending',
      },
    },
    Sending: {
      invoke: {
        src: 'sendMessage',
        meta: {
          foo: "bar"
        },
        onDone: 'Done',
        onError: 'Error',
      },
    },
    Error: {},
    Done: {
      type: 'final',
    },
  },
});
