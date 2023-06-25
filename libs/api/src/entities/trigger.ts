import {
  Entity,
  TriggerCommand,
  TriggerContext,
  TriggerEntity,
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
  let triggerEntity = entity as TriggerEntity;

  return createMachine({
    id: 'TriggerGameMachine',
    initial: 'Running',
    schema: {
      context: {} as TriggerContext,
      events: {} as TriggerCommand,
    },
    states: {
      Running: {
        invoke: {
          src: async (context) => {
            // TODO
            // Get the workflow ids that match this trigger

            // triggerEntity.workflowIds.map(workflowId);

            // return Promise.all(workflows)
          },
        },
      },
      Done: {},
    },
  });
};
