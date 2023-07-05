import { entitiesById, generateSnowflakeId, world } from '@explorers-club/api';
import { assert } from '@explorers-club/utils';
import {
  SnowflakeId,
  StrikersGameConfigData,
  StrikersGameEntity,
  StrikersPlayerEntity,
} from '@schema/types';
import { createEntity } from 'libs/api/src/ecs';

export const createStrikersGame = (props: {
  channelId: SnowflakeId;
  config: StrikersGameConfigData;
}) => {
  const gameEntityId = generateSnowflakeId();
  const p1SessionEntity = entitiesById.get(props.config.p1SessionId);
  assert(
    p1SessionEntity && p1SessionEntity.schema === 'session',
    "expected p1 sessionEntity but didn't exist"
  );
  assert(
    p1SessionEntity.userId,
    'expected userId on session when starting game for p1'
  );

  const p2SessionEntity = entitiesById.get(props.config.p2SessionId);
  assert(
    p2SessionEntity && p2SessionEntity.schema === 'session',
    "expected p2 sessionEntity but didn't exist"
  );
  assert(
    p2SessionEntity.userId,
    'expected userId on session when starting game for p2'
  );

  const p1Player = createEntity<StrikersPlayerEntity>({
    id: gameEntityId,
    schema: 'strikers_player',
    sessionId: p1SessionEntity.id,
    gameEntityId,
  });

  const p2Player = createEntity<StrikersPlayerEntity>({
    id: gameEntityId,
    schema: 'strikers_player',
    sessionId: p2SessionEntity.id,
    gameEntityId,
  });

  const gameEntity = createEntity<StrikersGameEntity>({
    id: gameEntityId,
    schema: 'strikers_game',
    gameId: 'strikers',
    config: {
      cards: [],
      gameMode: 'quickplay',
      turnsPerHalf: 0,
      p1SessionId: p1Player.id,
      p2SessionId: p2Player.id,
      extraTime: {
        minRounds: 2,
        maxRounds: 5,
      },
    },
    turnsIds: [],
  });

  world.add(gameEntity);
  return {} as StrikersGameEntity;
};
