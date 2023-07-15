import {
  Entity,
  StrikersEffectCommand,
  StrikersEffectContext,
  StrikersEffectMachine,
  StrikersPlayerCommand,
  StrikersPlayerContext,
  StrikersPlayerMachine,
  WithSenderId,
} from '@explorers-club/schema';
import { assertEntitySchema } from '@explorers-club/utils';
import * as effects from '../effects';
import { World } from 'miniplex';
import { createMachine } from 'xstate';

export const createStrikersEffectMachine = ({
  world,
  entity,
}: {
  world: World;
  entity: Entity;
}) => {
  assertEntitySchema(entity, 'strikers_effect');

  return createMachine({
    id: 'StrikersEffectMachine',
    initial: 'InProgress',
    schema: {
      context: {} as StrikersEffectContext,
      events: {} as WithSenderId<StrikersEffectCommand>,
    },
    states: {
      InProgress: {
        invoke: {
          src: async () => {
            //
          }
        }
      },
      WaitingForInput: {},
      Resolved: {},
    },
  }) satisfies StrikersEffectMachine;
};

const effectMachineMap = {
  MOVE: effects.createMoveActionMachine,
  PASS: effects.createPassActionMachine,
  SHOOT: effects.createShootActionMachine,
  INTERCEPT_ATTEMPT: effects.createInterceptionAttemptMachine,
  TACKLE_ATTEMPT: effects.createTackleAttemptMachine,
} as const;