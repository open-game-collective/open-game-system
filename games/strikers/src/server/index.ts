import { entitiesById, generateSnowflakeId, world } from '@explorers-club/api';
import {
  assert,
  assertChannelEntity,
  assertEntitySchema,
} from '@explorers-club/utils';
import { CardId } from '@schema/game-configuration/strikers';
import {
  LobbyGameConfig,
  SnowflakeId,
  StrikersCard,
  StrikersGameConfigData,
  StrikersGameEntity,
  StrikersPlayerEntity,
} from '@schema/types';
import { cardSettings, gameplaySettings } from '@strikers/config';
import { randomUUID } from 'crypto';
import { generateCard } from 'games/strikers/data/generateCards';
import { createEntity } from 'libs/api/src/ecs';

export const createStrikersGame = (
  channelId: SnowflakeId,
  lobbyConfig: LobbyGameConfig
) => {
  // const cards = cardData.map((item) => StrikersCardSchema.parse(item));
  const channelEntity = entitiesById.get(channelId);
  assertChannelEntity(channelEntity);

  // const gameConfig = StrikersGameConfigDataSchema.parse(
  //   channelEntity.currentGameConfiguration
  // );

  const gameEntityId = generateSnowflakeId();
  const p1UserEntity = entitiesById.get(lobbyConfig.p1UserId);
  assertEntitySchema(p1UserEntity, 'user');

  const p2UserEntity = entitiesById.get(lobbyConfig.p2UserId);
  assertEntitySchema(p2UserEntity, 'user');

  const p1PlayerEntity = createEntity<StrikersPlayerEntity>({
    schema: 'strikers_player',
    userId: p1UserEntity.id,
    gameEntityId,
  });

  const p2PlayerEntity = createEntity<StrikersPlayerEntity>({
    schema: 'strikers_player',
    userId: p2UserEntity.id,
    gameEntityId,
  });

  const cardsById = Array.from({ length: 200 })
    .map(generateCard)
    .reduce((acc, card) => {
      acc[card.id] = card;
      return acc;
    }, {} as Record<CardId, StrikersCard>);

  const config = {
    lobbyConfig,
    homeTeamCardIds: [p1PlayerEntity.id],
    awayTeamCardIds: [p2PlayerEntity.id],
    playerIds: [p1PlayerEntity.id, p2PlayerEntity.id], // for convenience, expect to never change
    gameplaySettings,
    cardSettings,
    cardsById,
    gameMode: 'quickplay',
    turnsPerHalf: 15,
    extraTime: {
      minRounds: 2,
      maxRounds: 5,
    },
  } satisfies StrikersGameConfigData;
  world.add(p1PlayerEntity);
  world.add(p2PlayerEntity);

  const gameEntity = createEntity<StrikersGameEntity>({
    id: gameEntityId,
    schema: 'strikers_game',
    gameId: 'strikers',
    config,
    gameState: {
      ballPosition: undefined,
      tilePositionsByCardId: {},
      sideACardIds: [],
      sideBCardIds: [],
      staminaByCardId: {},
    },
    turnsIds: [],
  });

  world.add(gameEntity);
  return gameEntity;
};
