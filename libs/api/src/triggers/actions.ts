import { WorkflowContext, WorkflowCommand } from '@explorers-club/schema';
import { assign } from 'xstate';

export const triggerActions = {
  setMetadata: assign({
    input: (context: WorkflowContext, event: WorkflowCommand, meta) => {
      console.log('running set metadata', meta.state?.meta);
      return context.input;
      // const value = getValueFromPath(event, invokeMeta.eventPath);

      // return {
      //   ...context.input,
      //   metadata: {
      //     ...context.input.metadata,
      //     [invokeMeta.key]: value,
      //   },
      // };
    },
  }),
};
