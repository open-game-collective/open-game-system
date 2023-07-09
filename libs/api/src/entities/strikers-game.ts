import {
  Entity,
  StrikersGameContext,
  StrikersGameCommand,
  StrikersGameEntity,
  WithSenderId,
  SnowflakeId,
} from '@explorers-club/schema';
import { Unarray, assert } from '@explorers-club/utils';
import type {
  StrikersBoard,
  StrikersBoardCard,
  StrikersCard,
  // StrikersLineupCommand,
  StrikersLineupContext,
  StrikersPlayerEntity,
  StrikersPlayerPosition,
  StrikersTeam,
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

  // const LineupMachine = createMachine(
  //   {
  //     id: 'LineupSetupMachine',
  //     initial: 'Initializing',
  //     context: {
  //       homeCardIds: [],
  //       awayCardIds: [],
  //     } satisfies StrikersLineupContext,
  //     schema: {
  //       // events: {} as WithSenderId<StrikersLineupCommand>,
  //       context: {} as StrikersLineupContext,
  //     },
  //     states: {
  //       Initializing: {
  //         always: {
  //           actions: 'initializeLineups',
  //           target: 'Complete',
  //         },
  //       },
  //       Complete: {
  //         type: 'final',
  //       },
  //     },
  //     predictableActionArguments: true,
  //   },
  //   {
  //     actions: {
  //       initializeLineups: assign((context, event) => {
  //         context = initializeLineups(entity.config.cards);
  //       }),
  //     },
  //   }
  // );
  const initialBoard = initializeBoard(entity.config.cards);

  return createMachine({
    id: 'StrikersGameMachine',
    initial: 'Playing',
    schema: {
      context: {} as StrikersGameContext,
      events: {} as WithSenderId<StrikersGameCommand>,
    },
    context: {
      initialBoard,
    },
    states: {
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
    predictableActionArguments: true,
  });
};

type InitializeLineupService = (cards: StrikersCard[]) => StrikersBoard;

const initializeBoard: InitializeLineupService = (cards) => {
  // Shuffle the cards to ensure randomness
  cards.sort(() => Math.random() - 0.5);

  const cardsById: Record<StrikersCard['id'], StrikersCard> = {};
  cards.forEach((card) => (cardsById[card.id] = card));

  // Initialize empty lists for each position
  const homeTeam: StrikersBoardCard[] = [];
  const awayTeam: StrikersBoardCard[] = [];

  // Distribute the cards to each team
  for (const card of cards) {
    const positionCount = (team: StrikersBoardCard[], position: string) =>
      team.filter(
        (playerCard) => cardsById[playerCard.cardId].rosterPosition === position
      ).length;

    if (
      positionCount(homeTeam, card.rosterPosition) <
      (card.rosterPosition === 'GK' ? 1 : card.rosterPosition === 'DEF' ? 4 : 3)
    ) {
      homeTeam.push({
        team: 'home',
        cardId: card.id,
        tilePosition: getTilePositionForPlayer(
          card.rosterPosition,
          'home',
          positionCount(homeTeam, card.rosterPosition)
        ),
      });
    } else if (
      positionCount(awayTeam, card.rosterPosition) <
      (card.rosterPosition === 'GK' ? 1 : card.rosterPosition === 'DEF' ? 4 : 3)
    ) {
      awayTeam.push({
        team: 'away',
        cardId: card.id,
        tilePosition: getTilePositionForPlayer(
          card.rosterPosition,
          'away',
          positionCount(awayTeam, card.rosterPosition)
        ),
      });
    }
  }

  // Join the teams and create the initial board state
  const initialBoardState: StrikersBoard = {
    ballPosition: [0, 0], // assuming the ball starts at the center
    possession: Math.random() > 0.5 ? 'away' : 'home', // todo flip a coin for a it
    players: [...homeTeam, ...awayTeam],
  };

  console.log({ homeTeam, awayTeam, initialBoardState });

  return initialBoardState;
};

function getTilePositionForPlayer(
  position: StrikersPlayerPosition,
  team: StrikersTeam,
  playerIndex: number
): [number, number] {
  // Define the column for each position and team
  const columns = {
    home: {
      GK: 0,
      DEF: 1,
      MID: 3,
      FWD: 5,
    },
    away: {
      GK: 12,
      DEF: 10,
      MID: 8,
      FWD: 7,
    },
  } as const;

  // The row for the player depends on their index within their position group
  const row = playerIndex * 2; // assuming 2 spaces between each player in a column

  return [columns[team][position], row];
}

// const initializeLineups: InitializeLineupsService = (cards) => {
//   const initializeLineups: InitializeLineupsService = (cards) => {
//     // Shuffle the cards to ensure randomness
//     cards.sort(() => Math.random() - 0.5);

//     // Initialize empty lists for each position
//     const homeTeam: PlayerCard[] = [];
//     const awayTeam: PlayerCard[] = [];

//     // Distribute the cards to each team
//     for (const card of cards) {
//       const positionCount = (team: PlayerCard[], position: string) =>
//         team.filter((playerCard) => playerCard.card.position === position).length;

//       if (
//         positionCount(homeTeam, card.position) <
//         (card.position === 'GK' ? 1 : card.position === 'DEF' ? 4 : 3)
//       ) {
//         homeTeam.push({
//           team: 'home',
//           cardId: card.id,
//           position: getPositionForPlayer(card.position, 'home', positionCount(homeTeam, card.position))
//         });
//       } else if (
//         positionCount(awayTeam, card.position) <
//         (card.position === 'GK' ? 1 : card.position === 'DEF' ? 4 : 3)
//       ) {
//         awayTeam.push({
//           team: 'away',
//           cardId: card.id,
//           position: getPositionForPlayer(card.position, 'away', positionCount(awayTeam, card.position))
//         });
//       }
//     }

//     // Join the teams and create the initial board state
//     const initialBoardState: BoardState = {
//       ballPosition: [0, 0], // assuming the ball starts at the center
//       possession: undefined, // no team starts with the ball
//       players: [...homeTeam, ...awayTeam]
//     };

//     console.log({ homeTeam, awayTeam, initialBoardState });

//     return initialBoardState;
//   };

//   function getPositionForPlayer(position: string, team: string, playerIndex: number): [number, number] {
//     // Define the column for each position and team
//     const columns = {
//       'home': {
//         'GK': 0,
//         'DEF': 1,
//         'MID': 3,
//         'FWD': 5,
//       },
//       'away': {
//         'GK': 12,
//         'DEF': 10,
//         'MID': 8,
//         'FWD': 7,
//       }
//     };

//     // The row for the player depends on their index within their position group
//     const row = playerIndex * 2; // assuming 2 spaces between each player in a column

//     return [columns[team][position], row];
//   }

//   // Shuffle the cards to ensure randomness
//   cards.sort(() => Math.random() - 0.5);

//   // Initialize empty lists for each position
//   const homeCardIds: string[] = [];
//   const awayCardIds: string[] = [];

//   // Distribute the cards to each team
//   for (const card of cards) {
//     const positionCount = (team: string[], position: string) =>
//       team.filter(
//         (id) => cards.find((card) => card.id === id)?.position === position
//       ).length;

//     if (
//       positionCount(homeCardIds, card.position) <
//       (card.position === 'GK' ? 1 : card.position === 'DEF' ? 4 : 3)
//     ) {
//       homeCardIds.push(card.id);
//     } else if (
//       positionCount(awayCardIds, card.position) <
//       (card.position === 'GK' ? 1 : card.position === 'DEF' ? 4 : 3)
//     ) {
//       awayCardIds.push(card.id);
//     }
//   }
//   console.log({ homeCardIds, awayCardIds });

//   return { homeCardIds, awayCardIds };
// };
