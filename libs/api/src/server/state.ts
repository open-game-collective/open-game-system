import { createMachine, interpret } from 'xstate';
import { Entity } from '@explorers-club/schema';
import { World } from 'miniplex';
import { createIndex } from '../world';
import { triggerDispatchMachine } from '../services/trigger-dispatch.service';

export const world = new World<Entity>();
export const entitiesById = createIndex(world);

const triggerDispatchService = interpret(
  triggerDispatchMachine.withContext({
    world,
    configs: [
      {
        id: 'GreetOnJoinRoom',
        event: {
          type: 'JOIN',
        },
        entity: {
          schema: 'room',
        },
        workflowConfig: createMachine({
          id: 'MyStateMachine',
          initial: 'Running',
          states: {
            Running: {},
          },
        }),
        inputs: [
          {
            inputType: 'entity',
            key: 'room',
            path: '/id',
          },
        ],
      },
    ],
  })
);
triggerDispatchService.start();
