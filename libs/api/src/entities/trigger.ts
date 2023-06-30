import {
  Entity,
  TriggerEntity,
  TriggerMachine,
  WorkflowCommand,
  WorkflowContext,
} from '@explorers-club/schema';
import { TriggerInputSchema } from '@schema/lib/trigger';
import { World } from 'miniplex';
import { createMachine } from 'xstate';
import { triggerServices } from '../triggers/services';

export const createTriggerMachine = ({
  world,
  entity,
}: {
  world: World;
  entity: Entity;
}) => {
  const triggerEntity = entity as TriggerEntity;
  const { workflowConfig } = triggerEntity.config;
  const services = {} as any;
  if (workflowConfig.services) {
    for (const serviceId in workflowConfig.services) {
      const triggerService = workflowConfig.services[serviceId];
      if (!triggerService) {
        continue;
      }

      const service = triggerServices[triggerService.serviceType];
      services[serviceId] = (
        context: WorkflowContext,
        event: WorkflowCommand /*, meta todo: use? */
      ) => {
        return service(context, event, triggerService);
      };
    }
  }

  const actions = {} as any;
  // todo do same we did for actiosn for others...
  // if (workflowConfig.actions) {
  //   for (const actionId in workflowConfig.actions) {
  //     actions[actionId];
  //   }
  // }

  const guards = {} as any;
  const delays = {} as any;
  const input = TriggerInputSchema.parse(triggerEntity.input);

  const workflowMachine = createMachine(
    triggerEntity.config.workflowConfig.machine
  )
    .withContext({
      entity: triggerEntity,
      input,
    } satisfies WorkflowContext)
    .withConfig({
      services,
      actions,
      guards,
      delays,
    });

  return createMachine({
    id: 'TriggerMachine',
    initial: 'Running',
    states: {
      Running: {
        invoke: {
          id: 'workflowService',
          src: workflowMachine,
        },
      },
    },
    predictableActionArguments: true,
  }) satisfies TriggerMachine;
};
