import { entitiesById } from '@api/index';
import {
  Entity,
  StrikersEffectData,
  StrikersEffectEntity,
  StrikersGameState,
} from '@explorers-club/schema';
import { assertEntitySchema } from '@explorers-club/utils';
import { compare } from 'fast-json-patch';
import { World } from 'miniplex';
import * as effects from '../effects';

export const createStrikersEffectMachine = ({
  world,
  entity,
}: {
  world: World;
  entity: Entity;
}) => {
  assertEntitySchema(entity, 'strikers_effect');
  const createEffectMachine = effectMachineMap[entity.data.type];

  const turnEntity = entitiesById.get(entity.turnId);
  assertEntitySchema(turnEntity, 'strikers_turn');
  const turnId = turnEntity.id;

  const gameEntity = entitiesById.get(turnEntity.gameEntityId);
  assertEntitySchema(gameEntity, 'strikers_game');

  const spawnChild = async (
    data: StrikersEffectData,
    nextGameState: StrikersGameState
  ) => {
    const patches = compare(gameEntity.gameState, nextGameState);

    const { createEntity } = await import('@api/ecs');
    const child = createEntity<StrikersEffectEntity>({
      schema: 'strikers_effect',
      patches,
      parentId: entity.id,
      turnId: turnEntity.id,
      gameId: gameEntity.id,
      category: 'ACTION',
      data,
    });

    return child;
  };

  return createEffectMachine(entity.data, turnId, spawnChild);
};

const effectMachineMap = {
  MOVE: effects.createMoveActionMachine,
  PASS: effects.createPassActionMachine,
  SHOOT: effects.createShootActionMachine,
  INTERCEPT_ATTEMPT: effects.createInterceptionAttemptMachine,
  TACKLE_ATTEMPT: effects.createTackleAttemptMachine,
} as const;
