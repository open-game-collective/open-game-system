import {
  Entity,
  BananaTradersGameCommand,
  BananaTradersGameContext,
} from '@explorers-club/schema';
import { World } from 'miniplex';
import { createMachine } from 'xstate';

export const createBananaTradersGameMachine = ({
  world,
}: {
  world: World;
  entity: Entity;
}) => {
  return createMachine({
    id: 'BananaTradersGameMachine',
    type: 'parallel',
    schema: {
      context: {} as BananaTradersGameContext,
      events: {} as BananaTradersGameCommand,
    },
    states: {},
  });
};
