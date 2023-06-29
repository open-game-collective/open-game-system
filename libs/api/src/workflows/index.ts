// import {
//   SendMessageMetadata,
//   WorkflowVariable,
//   WorkflowCommand,
//   WorkflowContext,
// } from '@explorers-club/schema';
// import { assert, getValueFromPath } from '@explorers-club/utils';
// import { GuardMeta, assign } from 'xstate';
// import { entitiesById } from '../server/state';

// export const workflowServices = {
//   sendMessage: async (
//     context: WorkflowContext,
//     event: WorkflowCommand,
//     invokeMeta: SendMessageMetadata
//   ) => {
//     // const { sendMessage } = invokeMeta;

//     const templateVars = getAllTempateVars(
//       context,
//       event,
//       invokeMeta.variables
//     );
//     console.log('sendMessage', templateVars);

//     // sendMessage.

//     // How to I actually
//     // Do I send a command here? Or an event on the channel?

//     // How does onSubmit NAME_FORM, command SUBMIT_NAME

//     // Now I need to actually send a message
//     // invokeMeta.sendMessage.template
//     // const { channelId } = context.input;
//     // console.log('SEND MESSAGE WORKFLWO!', variables);

//     // The message interface

//     return '';
//   },
//   // broadcastMessage: async (
//   //   context: WorkflowContext,
//   //   event: WorkflowCommand,
//   //   invokeMeta: WorkflowInvokeMeta

//   // )
// };

// export const workflowGuards = {
//   // userIsLoggedIn: (
//   //   context: WorkflowContext,
//   //   event: WorkflowCommand,
//   //   invokeMeta: any
//   // ) => {
//   //   console.log('this is a guard! checking if user is lgoged in');
//   //   return false;
//   // },
//   matches: (
//     context: WorkflowContext,
//     event: WorkflowCommand,
//     guardMeta: GuardMeta<WorkflowContext, WorkflowCommand>
//   ) => {
//     console.log('MATCHES GUARD cond', guardMeta.cond);
//     console.log('MATCHES GUARD meta', guardMeta, event);
//     return false;
//     // switch (guardMeta.operator) {
//     //   case '==':
//     //     // getAllTempateVars()
//     //     // getValueFromInputConfig;
//     //     // invokeMeta.variable.
//     //     return;
//     //   case '<':
//     //     throw 'not implemented';
//     //   case '<==':
//     //     throw 'not implemented';
//     //   case '>':
//     //     throw 'not implemented';
//     //   case '>=':
//     //     throw 'not implemented';
//     //   case '!=':
//     //     throw 'not implemented';
//     //   case 'array-contains':
//     //     throw 'not implemented';
//     //   case 'array-contains-any':
//     //     throw 'not implemented';
//     //   case 'in':
//     //     throw 'not implemented';
//     //   case 'not-in':
//     //     throw 'not implemented';
//     // }
//     // const value

//     // if (invokeMeta.operator === "==") {

//     // } else if
//     // event.type == ""
//     // return true;
//   },
// };

// export const workflowActions = {
//   setMetadata: assign({
//     input: (context: WorkflowContext, event: WorkflowCommand, meta) => {
//       console.log('running set metadata', meta.state?.meta);
//       return context.input;
//       // const value = getValueFromPath(event, invokeMeta.eventPath);

//       // return {
//       //   ...context.input,
//       //   metadata: {
//       //     ...context.input.metadata,
//       //     [invokeMeta.key]: value,
//       //   },
//       // };
//     },
//   }),
// };

// const getAllTempateVars = (
//   context: WorkflowContext,
//   workflowEvent: WorkflowCommand,
//   variables: WorkflowVariable[]
// ) => {
//   const result: Record<WorkflowVariable['key'], any> = {};
//   for (const idx in variables) {
//     const variable = variables[idx];
//     const value = getTemplateVarValue(context, workflowEvent, variable);
//     result[variable.key] = value;
//   }

//   return result;
// };

// const getTemplateVarValue = (
//   context: WorkflowContext,
//   workflowEvent: WorkflowCommand,
//   variable: WorkflowVariable
// ) => {
//   const { input } = context;
//   // const { entity, event, eventSubject } = context.input;
//   if (variable.templateDataType === 'trigger_entity') {
//     return getValueFromPath(context.input.entity, variable.path);
//   } else if (variable.templateDataType === 'trigger_event') {
//     return getValueFromPath(input.event, variable.path);
//   } else if (variable.templateDataType === 'trigger_event_subject') {
//     assert(
//       'subjectId' in input.event,
//       'expected subjectId in trigger_event_subject but none found'
//     );
//     const subject = entitiesById.get(input.event.subjectId as string);
//     assert(
//       subject,
//       'expected subject but not found for ' + input.event.subjectId
//     );
//     return getValueFromPath(subject, variable.path);
//   } else if (variable.templateDataType === 'trigger_metadata') {
//     return getValueFromPath(input.metadata, variable.path);
//   } else if (variable.templateDataType === 'workflow_event') {
//     return getValueFromPath(workflowEvent, variable.path);
//   } else {
//     throw 'not implemented';
//   }
// };
