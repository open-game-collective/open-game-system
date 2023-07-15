// This folder holds the state machine implementations
// for each of the individual "effects" that can happen

import {
  StrikersEffectData,
  StrikersEffectEntity,
} from '@explorers-club/schema';
import { AnyStateMachine } from 'xstate';

export const createMoveActionMachine = (
  effect: StrikersEffectData,
  spawnChild: (
    effect: StrikersEffectData,
    spawnChild: (effect: StrikersEffectData) => StrikersEffectEntity
  ) => void
) => {
  return {} as AnyStateMachine;
};

export const createPassActionMachine = (
  effect: StrikersEffectData,
  spawnChild: (
    effect: StrikersEffectData,
    spawnChild: (effect: StrikersEffectData) => StrikersEffectEntity
  ) => void
) => {
  return {} as AnyStateMachine;
};

export const createShootActionMachine = (
  effect: StrikersEffectData,
  spawnChild: (effect: StrikersEffectData) => StrikersEffectEntity
) => {
  return {} as AnyStateMachine;
};

export const createTackleAttemptMachine = (
  effect: StrikersEffectData,
  spawnChild: (effect: StrikersEffectData) => StrikersEffectEntity
) => {
  return {} as AnyStateMachine;
};

export const createInterceptionAttemptMachine = (
  effect: StrikersEffectData
) => {
  return {} as AnyStateMachine;
};

export const createSaveAttemptMachine = (
  effect: StrikersEffectData,
  spawnChild: (effect: StrikersEffectData) => StrikersEffectEntity
) => {
  return {} as AnyStateMachine;
};

export const createPossessionBattleMachine = (
  effect: StrikersEffectData,
  spawnChild: (effect: StrikersEffectData) => StrikersEffectEntity
) => {
  return {} as AnyStateMachine;
};
