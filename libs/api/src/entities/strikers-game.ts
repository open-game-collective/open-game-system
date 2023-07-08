import {
  Entity,
  StrikersGameContext,
  StrikersGameCommand,
  StrikersGameEntity,
  WithSenderId,
  SnowflakeId,
} from '@explorers-club/schema';
import { assert } from '@explorers-club/utils';
import type {
  StrikersCard,
  // StrikersLineupCommand,
  StrikersLineupContext,
  StrikersPlayerEntity,
} from '@schema/types';
import { World } from 'miniplex';
import { createMachine } from 'xstate';
import { entitiesById, world } from '../server/state';
import { createSchemaIndex } from '../indices';
import { assign } from '@xstate/immer';

export const [strikersPlayersBySessionId] =
  createSchemaIndex<StrikersPlayerEntity>(
    world,
    'strikers_player',
    'sessionId'
  );

export const createStrikersGameMachine = ({
  world,
  entity,
}: {
  world: World;
  entity: Entity;
}) => {
  assert(entity.schema === 'strikers_game', 'expected strikers_game entity');

  const LineupMachine = createMachine(
    {
      id: 'LineupSetupMachine',
      initial: 'Initializing',
      context: {
        homeCardIds: [],
        awayCardIds: [],
      } satisfies StrikersLineupContext,
      schema: {
        // events: {} as WithSenderId<StrikersLineupCommand>,
        context: {} as StrikersLineupContext,
      },
      states: {
        Initializing: {
          always: {
            actions: 'initializeLineups',
            target: 'Complete',
          },
        },
        Complete: {
          type: 'final',
        },
      },
      predictableActionArguments: true,
    },
    {
      actions: {
        initializeLineups: assign((context, event) => {
          context = initializeLineups(entity.config.cards);
        }),
      },
    }
  );

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

type InitializeLineupsService = (cards: StrikersCard[]) => {
  homeCardIds: string[];
  awayCardIds: string[];
};

const initializeLineups: InitializeLineupsService = (cards) => {
  // Shuffle the cards to ensure randomness
  cards.sort(() => Math.random() - 0.5);

  // Initialize empty lists for each position
  const homeCardIds: string[] = [];
  const awayCardIds: string[] = [];

  // Distribute the cards to each team
  for (const card of cards) {
    const positionCount = (team: string[], position: string) =>
      team.filter(
        (id) => cards.find((card) => card.id === id)?.position === position
      ).length;

    if (
      positionCount(homeCardIds, card.position) <
      (card.position === 'GK' ? 1 : card.position === 'DEF' ? 4 : 3)
    ) {
      homeCardIds.push(card.id);
    } else if (
      positionCount(awayCardIds, card.position) <
      (card.position === 'GK' ? 1 : card.position === 'DEF' ? 4 : 3)
    ) {
      awayCardIds.push(card.id);
    }
  }
  console.log({ homeCardIds, awayCardIds });

  return { homeCardIds, awayCardIds };
};
