import { EventTriggerConfigSchema } from '../../../schema/src';


// export const greetOnJoinTrigger = {
//   id: 'GreetOnJoinRoom',
//   triggerType: 'event',
//   event: {
//     type: 'JOIN',
//   },
//   entity: {
//     schema: 'room',
//   },
//   workflowConfig: {
//     machine: {
//       id: 'MyStateMachine',
//       initial: 'Running',
//       states: {
//         Running: {
//           invoke: {
//             src: 'sendJoinMessage',
//             onDone: 'NextMessage',
//           },
//         },
//         NextMessage: {
//           always: [
//             {
//               target: 'WasTrue',
//               cond: 'myGuard',
//             },
//             {
//               target: 'WasFalse',
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
//     },
//     services: {
//       sendJoinMessage: {
//         serviceType: 'sendMessage',
//         channelId: {
//           templateDataType: 'trigger_entity',
//           path: '/id',
//         },
//         recipientId: {
//           templateDataType: 'trigger_entity',
//           path: '/id',
//         },
//         senderId: {
//           templateDataType: 'trigger_event_subject',
//           path: '/id',
//         },
//         template: {
//           markup: 'Hello c{channelId} r {recipientId} s{senderId}',
//           handlers: {
//             onSubmit: {
//               FOO: {
//                 command: 'MY_COMMAND',
//               },
//             },
//           },
//           variables: [],
//         },
//       },
//     },
//   },
// } satisfies EventTriggerConfigSchema;

// const meta = {
//   template: `Hello <PlayerAvatar userName={userName} roomSlug={roomSlug} />. <Group><Button id="YES" requireConfirmation={true} /><Button id="NO" /> /> <Form id="NAME_FORM"><TextInput id="NAME" /></Form></Group>`,
//   handlers: {
//     onConfirm: {
//       YES: {
//         command: 'CONFIRM_YES',
//       },
//     },
//     onPress: {
//       YES: {
//         command: 'PRESS_YES',
//       },
//     },
//     onSubmit: {
//       NAME_FORM: {
//         command: 'SUBMIT_NAME',
//       },
//     },
//   },
//   variables: [
//     {
//       templateDataType: 'trigger_entity',
//       key: 'userName',
//       path: '/slug',
//     },
//     {
//       templateDataType: 'trigger_event',
//       key: 'roomSlug',
//       path: '/name',
//     },
//   ],
// }
