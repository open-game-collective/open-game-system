import { entitiesById, generateSnowflakeId, world } from '@explorers-club/api';
import { assert, assertChannelEntity } from '@explorers-club/utils';
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
    playerIds: [p1Player.id, p2Player.id],
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
          tilePosition: [-1, 0],
          stamina: 7,
        },
        {
          team: 'away',
          cardId: '5678',
          tilePosition: [1, 0],
          stamina: 6,
        },
      ],
    },
    turnsIds: [],
  });

  world.add(gameEntity);
  return gameEntity;
};
