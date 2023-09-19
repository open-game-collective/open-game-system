// This folder holds the state machine implementations
// for each of the individual "effects" that can happen

import { entitiesById } from '@api/index';
import {
  SnowflakeId,
  StrikersEffectData,
  StrikersEffectEntity,
  StrikersGameState,
} from '@explorers-club/schema';
import { assert, assertEntitySchema } from '@explorers-club/utils';
import { AnyStateMachine, createMachine } from 'xstate';

export const createMoveActionMachine = (
  data: StrikersEffectData,
  turnId: SnowflakeId,
  spawnChild: (
    data: StrikersEffectData,
    gameState: StrikersGameState
  ) => Promise<StrikersEffectEntity>
) => {
  assert(data.type === 'MOVE', 'expected data type to be move');
  const turnEntity = entitiesById.get(turnId);
  assertEntitySchema(turnEntity, 'strikers_turn');

  const gameEntity = entitiesById.get(turnEntity.gameEntityId);
  assertEntitySchema(gameEntity, 'strikers_game');

  const initial = 'Resolved';

  console.log(gameEntity.gameState);

  // If there are now two players

  return createMachine({
    initial,
    states: {
      InProgress: {},
      Resolved: {},
    },
  }) satisfies AnyStateMachine;
};

export const createPassActionMachine = (
  data: StrikersEffectData,
  turnId: SnowflakeId,
  spawnChild: (
    data: StrikersEffectData,
    gameState: StrikersGameState
  ) => Promise<StrikersEffectEntity>
) => {
  return {} as AnyStateMachine;
};

export const createShootActionMachine = (
  data: StrikersEffectData,
  turnId: SnowflakeId,
  spawnChild: (
    data: StrikersEffectData,
    gameState: StrikersGameState
  ) => Promise<StrikersEffectEntity>
) => {
  return {} as AnyStateMachine;
};

export const createTackleAttemptMachine = (
  data: StrikersEffectData,
  turnId: SnowflakeId,
  spawnChild: (
    data: StrikersEffectData,
    gameState: StrikersGameState
  ) => Promise<StrikersEffectEntity>
) => {
  return {} as AnyStateMachine;
};

export const createInterceptionAttemptMachine = (
  data: StrikersEffectData,
  turnId: SnowflakeId,
  spawnChild: (
    data: StrikersEffectData,
    gameState: StrikersGameState
  ) => Promise<StrikersEffectEntity>
) => {
  return {} as AnyStateMachine;
};

export const createSaveAttemptMachine = (
  data: StrikersEffectData,
  spawnChild: (
    data: StrikersEffectData,
    gameState: StrikersGameState
  ) => Promise<StrikersEffectEntity>
) => {
  return {} as AnyStateMachine;
};

export const createPossessionBattleMachine = (
  data: StrikersEffectData,
  spawnChild: (
    data: StrikersEffectData,
    gameState: StrikersGameState
  ) => Promise<StrikersEffectEntity>
) => {
  return {} as AnyStateMachine;
};
