import {
  Entity,
  StrikersGameContext,
  StrikersGameCommand,
} from '@explorers-club/schema';
import { World } from 'miniplex';
import { createMachine } from 'xstate';

export const createStrikersGameMachine = ({
  world,
}: {
  world: World;
  entity: Entity;
}) => {
  return createMachine({
    id: 'StrikersGameMachine',
    initial: 'Setup',
    schema: {
      context: {} as StrikersGameContext,
      events: {} as StrikersGameCommand,
    },
    states: {
      Setup: {
        initial: 'Rosters',
        states: {
          Rosters: {},
          Lineups: {},
          Pitch: {},
        },
      },
      Playing: {
        initial: "FirstHalf",
        states: {
          FirstHalf: {},
          SecondHalf: {},
        },
      },
      Complete: {},
    },
  });
};
