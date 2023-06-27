import { createMachine } from 'xstate';
import {
  EventTriggerConfigSchema,
  SendMessageInvokeMeta,
  TriggerConfig,
} from '../../../schema/src';

export const greetOnJoinTrigger = {
  id: 'GreetOnJoinRoom',
  triggerType: 'event',
  event: {
    type: 'JOIN',
  },
  entity: {
    schema: 'room',
  },
  workflowConfig: {
    machine: {
      id: 'MyStateMachine',
      initial: 'Running',
      states: {
        Running: {
          invoke: {
            src: 'sendMessage',
            onDone: 'NextMessage',
            meta: {
              // template: `Hello <PlayerAvatar userName={userName} roomSlug={roomSlug} />. <Group><Button id="YES" requireConfirmation={true} /><Button id="NO" /> /> <Form id="NAME_FORM"><TextInput id="NAME" /></Form></Group>`,
              template: `Welcome Miner #{}`,
              handlers: {
                onConfirm: {
                  YES: {
                    command: 'CONFIRM_YES',
                  },
                },
                onPress: {
                  YES: {
                    command: 'PRESS_YES',
                  },
                },
                onSubmit: {
                  NAME_FORM: {
                    command: 'SUBMIT_NAME',
                  },
                },
              },
              variables: [
                {
                  templateDataType: 'trigger_entity',
                  key: 'userName',
                  path: '/slug',
                },
                {
                  templateDataType: 'trigger_event',
                  key: 'roomSlug',
                  path: '/name',
                },
              ],
            } satisfies SendMessageInvokeMeta,
          },
        },
        NextMessage: {
          always: [
            {
              target: 'WasTrue',
              cond: 'matches',
              meta: {
                MY_META: 'HELLO!!!!',
              },
            },
            {
              target: 'WasFalse',
              cond: 'matches',
              meta: {
                M_OTHER_META: 'WEFWEFEW!!!',
              },
            },
            {
              target: 'WasTrue',
            },
          ],
        },
        WasTrue: {},
        WasFalse: {},
        // pseudo code for name capture...
        // System Message
        // HR Bot
        // System Message
        // HR Bot
      },
    },
  },
  //   inputVariablesConfig: [
  //     {
  //       inputType: 'variable',
  //       key: 'myKey',
  //       value: 'myValue',
  //     },
  //   ],
} satisfies EventTriggerConfigSchema;
