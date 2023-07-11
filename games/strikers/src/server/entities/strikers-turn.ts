import { Entity, WithSenderId } from '@explorers-club/schema';
import { StrikersTurnCommand, StrikersTurnContext } from '@schema/types';
import { World } from 'miniplex';
import { createMachine } from 'xstate';

export const createStrikersTurnMachine = ({
  world,
}: {
  world: World;
  entity: Entity;
}) => {
  return createMachine({
    id: 'StrikersTurnMachine',
    initial: 'Complete',
    schema: {
      context: {} as StrikersTurnContext,
      events: {} as WithSenderId<StrikersTurnCommand>,
    },
    states: {
      Complete: {
        initial: 'False',
        states: {
          False: {
            after: {
              2000: 'True',
            },
          },
          True: {},
        },
      },
    },
  });
};
