import {
  Entity,
  StrikersGameContext,
  StrikersGameCommand,
  StrikersGameEntity,
  WithSenderId,
  SnowflakeId,
} from '@explorers-club/schema';
import { World } from 'miniplex';
import { createMachine } from 'xstate';
import { entitiesById } from '../server/state';
import { assert } from '@explorers-club/utils';
import { createSchemaIndex } from '../indices';

// createSchemaIndex({
// })
// createSchemaIndex(world, "")

export const createStrikersGameMachine = ({
  world,
  entity,
}: {
  world: World;
  entity: Entity;
}) => {
  const strikersGame = entity as StrikersGameEntity;
  // strikersGame.config.

  const getPlayer = (senderId: SnowflakeId) => {
    const sessionEntity = entitiesById.get(senderId);
    assert(sessionEntity && sessionEntity.schema === "session", "expected sessionEntity when looking up player")


    sessionEntity.userId
    // return {} as 
  }

  return createMachine({
    id: 'StrikersGameMachine',
    initial: 'Setup',
    schema: {
      context: {} as StrikersGameContext,
      events: {} as WithSenderId<StrikersGameCommand>,
    },
    states: {
      Setup: {
        initial: 'Rosters',
        states: {
          Rosters: {},
          Lineups: {},
        },
      },
      Playing: {
        initial: 'FirstHalf',
        states: {
          FirstHalf: {},
          Intermission: {},
          SecondHalf: {},
        },
      },
      Complete: {},
    },
  });
};
