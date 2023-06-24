import {
  Entity,
  WorkflowCommand,
  WorkflowContext,
  WorkflowEntity,
} from '@explorers-club/schema';
import { World } from 'miniplex';
import { createMachine } from 'xstate';

export const createWorkflowMachine = ({
  world,
  entity,
}: {
  world: World;
  entity: Entity;
}) => {
  // const workflowEntity = entity as WorkflowEntity;

  return createMachine({
    id: 'WorkflowMachine',
    type: 'parallel',
    schema: {
      context: {} as WorkflowContext,
      events: {} as WorkflowCommand,
    },
    states: {
      Running: {
        initial: 'True',
        states: {
          True: {},
          False: {},
        },
      },
      Complete: {
        initial: 'False',
        states: {
          True: {},
          False: {},
        },
      },
    },
  });
};
