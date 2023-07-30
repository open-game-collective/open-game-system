import { entitiesById, generateSnowflakeId, world } from '@explorers-club/api';
import {
  assert,
  assertChannelEntity,
  assertEntitySchema,
} from '@explorers-club/utils';
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

  const defaultCameraPosition = {
    x: 0,
    y: 10,
    z: 120,
    targetX: 0,
    targetY: 0,
    targetZ: -20,
  };

  const p1PlayerEntity = createEntity<StrikersPlayerEntity>({
    schema: 'strikers_player',
    userId: p1UserEntity.id,
    gameEntityId,
    cameraPosition: defaultCameraPosition,
  });

  const p2PlayerEntity = createEntity<StrikersPlayerEntity>({
    schema: 'strikers_player',
    userId: p2UserEntity.id,
    gameEntityId,
    cameraPosition: defaultCameraPosition,
  });

  const cards = [
    {
      id: '1234',
      name: 'J. Moreno',
      team: 'Oakland Roots',
      rosterPosition: 'FWD',
      league: 'EPL',
      year: 2023,
      possession: 12,
      speed: 'A',
      endurance: 7,
      salary: 10000,
      possessionChartWeights: {
        plusOneAction: {
          orderWeight: 0,
          rollWeight: 10,
        },
      },
      shotChartWeights: {
        save: 10,
        corner: 10,
        deflect: 10,
        goal: 10,
      },
    },
    {
      id: '5678',
      name: 'J. Lin',
      team: 'Bristol Rovers',
      rosterPosition: 'MID',
      league: 'EPL',
      year: 2022,
      possession: 11,
      speed: 'S',
      endurance: 6,
      salary: 90000,
      possessionChartWeights: {
        plusOneAction: {
          orderWeight: 0,
          rollWeight: 10,
        },
      },
      shotChartWeights: {
        save: 10,
        corner: 10,
        deflect: 10,
        goal: 10,
      },
    },
  ] satisfies StrikersCard[];

  const config = {
    lobbyConfig,
    playerIds: [p1PlayerEntity.id, p2PlayerEntity.id],
    gameplaySettings,
    cardSettings,
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
    gameState: {
      ballPosition: [0, 0],
      possession: 'home',
      players: [
        {
          team: 'home',
          cardId: '1234',
          tilePosition: [14, 10],
          stamina: 7,
        },
        {
          team: 'away',
          cardId: '5678',
          tilePosition: [11, 10],
          stamina: 6,
        },
      ],
    },
    turnsIds: [],
  });

  world.add(p1PlayerEntity);
  world.add(p2PlayerEntity);
  world.add(gameEntity);
  return gameEntity;
};
