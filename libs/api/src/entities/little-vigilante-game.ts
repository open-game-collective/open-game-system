import {
    Entity,
    LittleVigilanteGameCommand,
    LittleVigilanteGameContext,
  } from '@explorers-club/schema';
  import { World } from 'miniplex';
  import { createMachine } from 'xstate';
  
  export const createLittleVigilanteGameMachine = ({
    world,
  }: {
    world: World;
    entity: Entity;
  }) => {
    return createMachine({
      id: 'LittleVigilanteGameMachine',
      type: 'parallel',
      schema: {
        context: {} as LittleVigilanteGameContext,
        events: {} as LittleVigilanteGameCommand,
      },
      states: {},
    });
  };
  