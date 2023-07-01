import { Entity, WithSenderId } from '@explorers-club/schema';
import { StrikersTurnCommand, StrikersTurnContext } from '@schema/types';
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
      context: {} as StrikersTurnContext,
      events: {} as WithSenderId<StrikersTurnCommand>,
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
        initial: 'FirstHalf',
        states: {
          FirstHalf: {},
          SecondHalf: {},
        },
      },
      Complete: {},
    },
  });
};
