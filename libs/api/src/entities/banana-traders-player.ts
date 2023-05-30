import {
    Entity,
    BananaTradersPlayerCommand,
    BananaTradersPlayerContext,
  } from '@explorers-club/schema';
  import { World } from 'miniplex';
  import { createMachine } from 'xstate';
  
  export const createBananaTradersPlayerMachine = ({
    world,
  }: {
    world: World;
    entity: Entity;
  }) => {
    return createMachine({
      id: 'BananaTradersPlayerMachine',
      type: 'parallel',
      schema: {
        context: {} as BananaTradersPlayerContext,
        events: {} as BananaTradersPlayerCommand,
      },
      states: {},
    });
  };
  