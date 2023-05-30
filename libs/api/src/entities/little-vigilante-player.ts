import {
  Entity,
  LittleVigilantePlayerCommand,
  LittleVigilantePlayerContext,
} from '@explorers-club/schema';
import { World } from 'miniplex';
import { createMachine } from 'xstate';

export const createLittleVigilantePlayerMachine = ({
  world,
}: {
  world: World;
  entity: Entity;
}) => {
  return createMachine({
    id: 'LittleVigilantePlayerMachine',
    type: 'parallel',
    schema: {
      context: {} as LittleVigilantePlayerContext,
      events: {} as LittleVigilantePlayerCommand,
    },
    states: {},
  });
};
