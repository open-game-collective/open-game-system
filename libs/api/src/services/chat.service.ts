import {
  ChatCommand,
  ChatContext,
  NewRoomCommand,
  NewRoomContext,
} from '@explorers-club/schema';
import { assign, createMachine } from 'xstate';

export const chatMachine = createMachine({
  id: 'ChatMachine',
  initial: 'Initializing',
  schema: {
    events: {} as ChatCommand,
    context: {} as ChatContext,
  },
  states: {
    Initializing: {
      invoke: {
        onError: 'Error',
        onDone: 'Loaded',
        src: async () => {
          // Fetch the initial messages
          // Where would these come from?
          return 'hi';
        },
      },
    },
    Error: {},
    Loaded: {},
  },
});
