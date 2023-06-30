import {
  Entity,
  StrikersGameContext,
  StrikersGameCommand,
} from '@explorers-club/schema';
import { World } from 'miniplex';
import { createMachine } from 'xstate';

export const createStrikersGameTurnMachine = ({
  world,
}: {
  world: World;
  entity: Entity;
}) => {
  return createMachine({
    id: 'StrikersGameTurnMachine',
    initial: 'Setup',
    schema: {
      context: {} as StrikersGameTurnContext,
      events: {} as StrikersGameTurnCommand,
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
