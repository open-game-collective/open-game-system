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
    // const TriggerEntity = entity as TriggerEntity;
  
    return createMachine({
      id: 'TriggerMachine',
      type: 'parallel',
      schema: {
        context: {} as TriggerContext,
        events: {} as TriggerCommand,
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
  