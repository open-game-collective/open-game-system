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
      entry: (context, event) => {
        console.log(context, event);
      },
    },
  },
});
