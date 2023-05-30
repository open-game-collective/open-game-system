import {
    Entity,
    CodebreakersPlayerCommand,
    CodebreakersPlayerContext,
  } from '@explorers-club/schema';
  import { World } from 'miniplex';
  import { createMachine } from 'xstate';
  
  export const createCodebreakersPlayerMachine = ({
    world,
  }: {
    world: World;
    entity: Entity;
  }) => {
    return createMachine({
      id: 'CodebreakersPlayerMachine',
      type: 'parallel',
      schema: {
        context: {} as CodebreakersPlayerContext,
        events: {} as CodebreakersPlayerCommand,
      },
      states: {},
    });
  };
  