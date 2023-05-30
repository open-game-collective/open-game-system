import {
    Entity,
    CodebreakersGameCommand,
    CodebreakersGameContext,
  } from '@explorers-club/schema';
  import { World } from 'miniplex';
  import { createMachine } from 'xstate';
  
  export const createCodebreakersGameMachine = ({
    world,
  }: {
    world: World;
    entity: Entity;
  }) => {
    return createMachine({
      id: 'CodebreakersGameMachine',
      type: 'parallel',
      schema: {
        context: {} as CodebreakersGameContext,
        events: {} as CodebreakersGameCommand,
      },
      states: {},
    });
  };
  