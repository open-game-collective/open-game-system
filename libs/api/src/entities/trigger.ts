import {
  Entity,
  SessionCommand,
  SessionContext,
  SessionTypeState,
  SnowflakeId,
  TriggerEntity,
  TriggerMachine,
} from '@explorers-club/schema';
import { World } from 'miniplex';
import { createMachine } from 'xstate';

export const createTriggerMachine = ({
  world,
  entity,
}: {
  world: World;
  entity: Entity;
}) => {
  const triggerEntity = entity as TriggerEntity;
  //   const services = {} as Record<string, keyof typeof triggerEntity.con>;
  triggerEntity.config;
  const { workflowConfig } = triggerEntity.config;
  const services = {} as any;
  if (workflowConfig.services) {
    for (const serviceId in workflowConfig.services) {
      services[serviceId];
    }
  }

  const actions = {} as any;
  const guards = {} as any;
  const delays = {} as any;

  //   const services = {} as any;
  //   if (work)
  //   for (const serviceId of workflowConfig.services) {

  //   }

  const workflowMachine = createMachine(
    triggerEntity.config.workflowConfig.machine,
    {
      services,
      actions,
      guards,
      delays,
    }
  );

  return createMachine({
    id: 'TriggerMachine',
    initial: 'Running',
    states: {
      Running: {
        invoke: {
          src: workflowMachine,
        },
      },
    },
    predictableActionArguments: true,
  }) satisfies TriggerMachine;

  //   const triggerEntity = entity as TriggerEntity;

  //   const greetOnJoinTrigger = {
  //     id: 'GreetOnJoinRoom',
  //     workflowType: 'channel_workflow',
  //     event: {
  //       type: 'JOIN',
  //     },
  //     entity: {
  //       schema: 'room',
  //     },
  //     workflowConfig: createMachine({
  //       id: 'MyStateMachine',
  //       initial: 'Running',
  //       states: {
  //         Running: {
  //           invoke: {
  //             src: 'sendMessage',
  //             onDone: 'NextMessage',
  //             meta: {
  //               // template: `Hello <PlayerAvatar userName={userName} roomSlug={roomSlug} />. <Group><Button id="YES" requireConfirmation={true} /><Button id="NO" /> /> <Form id="NAME_FORM"><TextInput id="NAME" /></Form></Group>`,
  //               template: `Welcome Miner #{}`,
  //               handlers: {
  //                 onConfirm: {
  //                   YES: {
  //                     command: 'CONFIRM_YES',
  //                   },
  //                 },
  //                 onPress: {
  //                   YES: {
  //                     command: 'PRESS_YES',
  //                   },
  //                 },
  //                 onSubmit: {
  //                   NAME_FORM: {
  //                     command: 'SUBMIT_NAME',
  //                   },
  //                 },
  //               },
  //               variables: [
  //                 {
  //                   templateDataType: 'trigger_entity',
  //                   key: 'userName',
  //                   path: '/slug',
  //                 },
  //                 {
  //                   templateDataType: 'trigger_event',
  //                   key: 'roomSlug',
  //                   path: '/name',
  //                 },
  //               ],
  //             },
  //           },
  //         },
  //         NextMessage: {
  //           always: [
  //             {
  //               target: 'WasTrue',
  //               cond: 'matches',
  //               meta: {
  //                 MY_META: 'HELLO!!!!',
  //               },
  //             },
  //             {
  //               target: 'WasFalse',
  //               cond: 'matches',
  //               meta: {
  //                 M_OTHER_META: 'WEFWEFEW!!!',
  //               },
  //             },
  //             {
  //               target: 'WasTrue',
  //             },
  //           ],
  //         },
  //         WasTrue: {},
  //         WasFalse: {},
  //         // pseudo code for name capture...
  //         // System Message
  //         // HR Bot
  //         // System Message
  //         // HR Bot
  //       },
  //     }),
  //     //   inputVariablesConfig: [
  //     //     {
  //     //       inputType: 'variable',
  //     //       key: 'myKey',
  //     //       value: 'myValue',
  //     //     },
  //     //   ],
  //   } satisfies TriggerConfig;

  //   return createMachine<SessionContext, SessionCommand, SessionTypeState>({
  //     id: 'SessionMachine',
  //     context: {
  //       foo: 'bar',
  //     },
  //     type: 'parallel',
  //     states: {
  //       Connected: {
  //         initial: 'No',
  //         states: {
  //           Yes: {},
  //           No: {},
  //         },
  //       },
  //       // Unitialized: {
  //       //   on: {
  //       //     INITIALIZE: 'Initializing',
  //       //   },
  //       // },
  //       Initialized: {},
  //       Error: {},
  //     },
  //     predictableActionArguments: true,
  //   });
};
