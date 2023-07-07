import { entitiesById, generateSnowflakeId, world } from '@explorers-club/api';
import { assert, assertChannelEntity } from '@explorers-club/utils';
import {
  StrikersCardSchema,
  StrikersGameConfigDataSchema,
} from '@schema/game-configuration/strikers';
import {
  LobbyGameConfig,
  SnowflakeId,
  StrikersGameConfigData,
  StrikersGameEntity,
  StrikersPlayerEntity,
} from '@schema/types';
import { createEntity } from 'libs/api/src/ecs';
import * as cardData from '../../data/cards.json';

export const createStrikersGame = (
  channelId: SnowflakeId,
  lobbyConfig: LobbyGameConfig
) => {
  const cards = cardData.map((item) => StrikersCardSchema.parse(item));
  const channelEntity = entitiesById.get(channelId);
  assertChannelEntity(channelEntity);

  // const gameConfig = StrikersGameConfigDataSchema.parse(
  //   channelEntity.currentGameConfiguration
  // );

  const gameEntityId = generateSnowflakeId();
  const p1SessionEntity = entitiesById.get(lobbyConfig.p1SessionId);
  assert(
    p1SessionEntity && p1SessionEntity.schema === 'session',
    "expected p1 sessionEntity but didn't exist"
  );
  // assert(
  //   p1SessionEntity.userId,
  //   'expected userId on session when starting game for p1'
  // );

  const p2SessionEntity = entitiesById.get(lobbyConfig.p2SessionId);
  assert(
    p2SessionEntity && p2SessionEntity.schema === 'session',
    "expected p2 sessionEntity but didn't exist"
  );
  // assert(
  //   p2SessionEntity.userId,
  //   'expected userId on session when starting game for p2'
  // );

  const p1Player = createEntity<StrikersPlayerEntity>({
    schema: 'strikers_player',
    sessionIds: [p1SessionEntity.id],
    gameEntityId,
  });

  const p2Player = createEntity<StrikersPlayerEntity>({
    schema: 'strikers_player',
    sessionIds: [p2SessionEntity.id],
    gameEntityId,
  });

  const config = {
    lobbyConfig,
    playerIds: [p1Player.id, p2Player.id],
    cards,
    gameMode: 'quickplay',
    turnsPerHalf: 15,
    extraTime: {
      minRounds: 2,
      maxRounds: 5,
    },
  } satisfies StrikersGameConfigData;

  const gameEntity = createEntity<StrikersGameEntity>({
    id: gameEntityId,
    schema: 'strikers_game',
    gameId: 'strikers',
    config,
    turnsIds: [],
  });

  world.add(gameEntity);
  return gameEntity;
};
