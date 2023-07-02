import {
  Entity,
  StrikersGameContext,
  StrikersGameCommand,
  StrikersGameEntity,
  WithSenderId,
  SnowflakeId,
} from '@explorers-club/schema';
import { assert } from '@explorers-club/utils';
import type { StrikersPlayerEntity } from '@schema/types';
import { World } from 'miniplex';
import { createMachine } from 'xstate';
import { entitiesById, world } from '../server/state';
import { createSchemaIndex } from '../indices';

// createSchemaIndex({
// })
// createSchemaIndex(world, "")
export const [strikersPlayersByUserId] =
  createSchemaIndex<StrikersPlayerEntity>(world, 'strikers_player', 'userid');

export const createStrikersGameMachine = ({
  world,
  entity,
}: {
  world: World;
  entity: Entity;
}) => {
  assert(entity.schema === 'strikers_game', 'expected strikers_game entity');

  const getPlayer = (senderId: SnowflakeId) => {
    const sessionEntity = entitiesById.get(senderId);
    assert(
      sessionEntity && sessionEntity.schema === 'session',
      'expected sessionEntity when looking up player'
    );

    const strikersPlayerEntity = strikersPlayersByUserId.get(
      sessionEntity.userId
    );
    assert(strikersPlayerEntity, 'strikers player entity');
    return strikersPlayerEntity;
  };

  return createMachine({
    id: 'StrikersGameMachine',
    initial: 'Setup',
    schema: {
      context: {} as StrikersGameContext,
      events: {} as WithSenderId<StrikersGameCommand>,
    },
    states: {
      Setup: {
        initial: 'Lineups',
        states: {
          Lineups: {
            invoke: {
              id: 'lineups',
              src: LineupMachine,
            },
            onDone: 'Complete',
          },
          Complete: {
            type: 'final',
          },
        },
        onDone: 'Playing',
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

const LineupMachine = createMachine({
  id: 'LineupSetupMachine',
  initial: 'ChoosingPlayers',
  states: {
    ChoosingPlayers: {},
  },
});
