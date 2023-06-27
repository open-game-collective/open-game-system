import { WorkflowContext, WorkflowCommand } from '@explorers-club/schema';
import { GuardMeta } from 'xstate';

export const triggerGuards = {
  // userIsLoggedIn: (
  //   context: WorkflowContext,
  //   event: WorkflowCommand,
  //   invokeMeta: any
  // ) => {
  //   console.log('this is a guard! checking if user is lgoged in');
  //   return false;
  // },
  matches: (
    context: WorkflowContext,
    event: WorkflowCommand,
    guardMeta: GuardMeta<WorkflowContext, WorkflowCommand>
  ) => {
    console.log('MATCHES GUARD cond', guardMeta.cond);
    console.log('MATCHES GUARD meta', guardMeta, event);
    return false;
    // switch (guardMeta.operator) {
    //   case '==':
    //     // getAllTempateVars()
    //     // getValueFromInputConfig;
    //     // invokeMeta.variable.
    //     return;
    //   case '<':
    //     throw 'not implemented';
    //   case '<==':
    //     throw 'not implemented';
    //   case '>':
    //     throw 'not implemented';
    //   case '>=':
    //     throw 'not implemented';
    //   case '!=':
    //     throw 'not implemented';
    //   case 'array-contains':
    //     throw 'not implemented';
    //   case 'array-contains-any':
    //     throw 'not implemented';
    //   case 'in':
    //     throw 'not implemented';
    //   case 'not-in':
    //     throw 'not implemented';
    // }
    // const value

    // if (invokeMeta.operator === "==") {

    // } else if
    // event.type == ""
    // return true;
  },
};
