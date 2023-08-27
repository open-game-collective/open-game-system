import { generateSnowflakeId } from '@api/ids';
import { entitiesById } from '@api/index';
import { generateCard } from '../../../data/generateCards';
import {
  ChannelEvent,
  CreateEventProps,
  SnowflakeId,
  StrikersCard,
  StrikersGameEntity,
  StrikersGameEvent,
  StrikersGameEventInput,
  StrikersFieldSide,
  UpdateEventProps,
  WithSenderId,
  StrikersTeamSide,
} from '@explorers-club/schema';
import { assertEntitySchema } from '@explorers-club/utils';
import {
  Formation,
  FormationLiteral,
  LineupCommand,
  LineupContext,
} from '@schema/games/strikers';
import { assign } from '@xstate/immer';
import { Subject } from 'rxjs';
import { createMachine } from 'xstate';
import { z } from 'zod';
import { getSenderEntities } from '@api/server/utils';
import { CardId } from '@schema/game-configuration/strikers';
import { HexCoordinates } from 'honeycomb-grid';

export const createLineupMachine = <TMessage extends ChannelEvent>({
  gameChannel,
  gameEntity,
}: {
  gameChannel: Subject<StrikersGameEventInput>;
  gameEntity: StrikersGameEntity;
}) => {
  const lineupMachine = createMachine(
    {
      id: 'LineupMachine',
      initial: 'Initializing',
      schema: {
        events: {} as WithSenderId<LineupCommand>,
        context: {} as LineupContext,
      },
      context: {
        messageIdsByPlayerId: {},
        formationsByPlayerId: {},
        finishedPlayerIds: [],
      },
      states: {
        Initializing: {
          invoke: {
            onDone: 'SendMessages',
            src: async () => {
              // todo:
              // put
              const {
                tilePositionsByCardId,
                homeTeamCardIds,
                awayTeamCardIds,
              } = initializeBoard({
                cards: Object.values(gameEntity.config.cardsById),
              });

              gameEntity.gameState = {
                ...gameEntity.gameState,
                tilePositionsByCardId,
                sideACardIds: homeTeamCardIds,
                sideBCardIds: awayTeamCardIds,
              };
            },
          },
        },
        SendMessages: {
          invoke: {
            src: async () => {
              const result: Record<SnowflakeId, SnowflakeId> = {};
              gameEntity.config.playerIds.forEach((playerId) => {
                const id = generateSnowflakeId();

                const entity = entitiesById.get(playerId);
                assertEntitySchema(entity, 'strikers_player');

                gameChannel.next({
                  id,
                  type: 'MESSAGE',
                  recipientId: entity.userId,
                  contents: [
                    {
                      type: 'MultipleChoice',
                      showConfirm: true,
                      text: 'Choose starting formation',
                      options: ALL_FORMATIONS.map((formation) => ({
                        name: formation,
                        value: formation,
                      })),
                    },
                  ],
                });

                result[playerId] = id;
              });
              return result;
            },
            onDone: {
              target: 'WaitingForInput',
              actions: assign((context, event) => {
                context.messageIdsByPlayerId = event.data;
              }),
            },
          },
        },
        WaitingForInput: {
          on: {
            MULTIPLE_CHOICE_SELECT: {
              actions: assign((context, event) => {
                const formation = FormationLiteral.parse(event.value);

                const { userEntity } = getSenderEntities(event.senderId);
                const strikersPlayer = getStrikersPlayer(
                  userEntity.id,
                  gameEntity
                );

                context.formationsByPlayerId[strikersPlayer.id] = formation;

                const isHomeTeam = gameEntity.config.homeTeamCardIds.includes(
                  strikersPlayer.id
                );

                const newTilePositions: Record<CardId, HexCoordinates> = {};
                if (isHomeTeam) {
                  gameEntity.gameState.sideACardIds.map((id, index) => {
                    newTilePositions[id] = getTilePosition({
                      index,
                      formation,
                      side: 'A',
                    });
                  });
                } else {
                  gameEntity.gameState.sideBCardIds.map((id, index) => {
                    newTilePositions[id] = getTilePosition({
                      index,
                      formation,
                      side: 'B',
                    });
                  });
                }

                gameEntity.gameState = {
                  ...gameEntity.gameState,
                  tilePositionsByCardId: {
                    ...gameEntity.gameState.tilePositionsByCardId,
                    ...newTilePositions,
                  },
                };
              }),
            },
            CONFIRM: [
              {
                actions: 'markPlayerFinished',
                cond: 'allPlayersDone',
                target: 'Complete',
              },
              {
                actions: 'markPlayerFinished',
              },
            ],
          },
          onDone: 'Complete',
        },
        Complete: {
          data: (context) => context,
          type: 'final',
        },
      },
    },
    {
      actions: {
        markPlayerFinished: assign((context, event) => {
          const { userEntity } = getSenderEntities(event.senderId);
          const strikersPlayer = getStrikersPlayer(userEntity.id, gameEntity);

          context.finishedPlayerIds.push(strikersPlayer.id);
          const messageId = context.messageIdsByPlayerId[strikersPlayer.id];
          const formation = context.formationsByPlayerId[strikersPlayer.id];

          gameChannel.next({
            id: messageId,
            type: 'MESSAGE',
            contents: [
              {
                type: 'PlainMessage',
                avatarId: '',
                message: `Selected formation ${formation}`,
                timestamp: '',
              },
            ],
          });
        }),
      },
      guards: {
        allPlayersDone: (context) => {
          // hacky, gets called before the player gets added so use 1 instead of 2
          return context.finishedPlayerIds.length === 1;
        },
      },
    }
  );
  return lineupMachine;
};

/**
 * Gets the StrikersPlayerEntity for a given userId and StrikersGameEntity
 * @param userId
 * @param gameEntity
 */
const getStrikersPlayer = (
  userId: SnowflakeId,
  gameEntity: StrikersGameEntity
) => {
  const entity = gameEntity.config.playerIds
    .map((id) => {
      const entity = entitiesById.get(id);
      assertEntitySchema(entity, 'strikers_player');
      return entity;
    })
    .find((entity) => entity.userId == userId);
  assertEntitySchema(entity, 'strikers_player');
  return entity;
};

/**
 * Creates a random board for play using
 * randomly selected players
 *
 * Places each team in a 4-3-3 formation on their
 * sides of the field
 */
const initializeBoard = ({ cards }: { cards: StrikersCard[] }) => {
  const takenCardIds = new Set<CardId>();

  /**
   * Choose a random card depending on if
   */
  const selectRandomCard = (value: unknown, index: number) => {
    let availableSet: StrikersCard[];
    if (index === 0) {
      availableSet = cards.filter((card) => card.rosterPosition === 'GK');
    } else if (index <= 5) {
      availableSet = cards.filter((card) => card.rosterPosition === 'DEF');
    } else if (index <= 9) {
      availableSet = cards.filter((card) => card.rosterPosition === 'MID');
    } else {
      availableSet = cards.filter((card) => card.rosterPosition === 'FWD');
    }
    availableSet = availableSet.filter((card) => !takenCardIds.has(card.id));
    const card = availableSet[Math.floor(Math.random() * availableSet.length)];
    takenCardIds.add(card.id);
    return card;
  };

  const homeCards = Array.from({ length: 11 }).map(selectRandomCard);
  const awayCards = Array.from({ length: 11 }).map(selectRandomCard);

  const teamsByCardId: Record<CardId, StrikersTeamSide> = {};
  const tilePositionsByCardId: Record<CardId, HexCoordinates> = {};

  const defaultFormation = '4-3-3';

  homeCards.forEach((card, index) => {
    teamsByCardId[card.id] = 'home';
    tilePositionsByCardId[card.id] = getTilePosition({
      index,
      formation: defaultFormation,
      side: 'A',
    });
  });
  awayCards.forEach((card, index) => {
    teamsByCardId[card.id] = 'away';
    tilePositionsByCardId[card.id] = getTilePosition({
      index,
      formation: defaultFormation,
      side: 'B',
    });
  });

  const homeTeamCardIds = homeCards.map((card) => card.id);
  const awayTeamCardIds = awayCards.map((card) => card.id);

  return { homeTeamCardIds, awayTeamCardIds, tilePositionsByCardId };
};

const ALL_FORMATIONS: Formation[] = [
  '3-4-3',
  '3-5-2',
  '4-1-4-1',
  '4-2-3-1',
  '4-3-2-1',
  '4-3-3',
  '4-4-2',
  '4-5-1',
  '5-3-2',
  '5-4-1',
];

/**
 * For a given formation and side of the field, returns the
 * tile position that that "slot" in the roster would be
 * positioned on the field, given back in row/col coordinates.
 *
 * For field side A, players would be in rows [0-25], cols [0-17]
 * For field side B, players would be in rows [0-25], cols [18-35]
 *
 * Given a player's "index" in the roster, the further "north"
 * on the field they are and the further closer they are to
 * the opponent's goal. Typically you'll see indexes like...
 *
 * 0: GK
 * 1-5: DEF
 * 6-9: MID
 * 10-11: FWD
 *
 * depending on the formation.
 */
const getTilePosition = (props: {
  index: number;
  formation: Formation;
  side: StrikersFieldSide;
}): { col: number; row: number } => {
  const { index, formation, side } = props;

  // Define the positions for each formation
  const formations: Record<Formation, number[][]> = {
    '3-4-3': [
      [0, 12], // Goalkeeper
      [4, 10],
      [4, 12],
      [4, 14], // Defenders
      [10, 6],
      [10, 9],
      [10, 12],
      [10, 15],
      [10, 18], // Midfielders
      [16, 7],
      [16, 11],
      [16, 15], // Forwards
    ],

    '3-5-2': [
      [0, 12], // Goalkeeper
      [4, 8],
      [4, 12],
      [4, 16], // Defenders
      [8, 4],
      [8, 8],
      [8, 12],
      [8, 16],
      [8, 20], // Midfielders
      [14, 9],
      [14, 15], // Forwards
    ],

    '4-1-4-1': [
      [0, 12], // Goalkeeper
      [4, 9],
      [4, 11],
      [4, 13],
      [4, 15], // Defenders
      [8, 12], // Defensive Mid
      [12, 5],
      [12, 8],
      [12, 12],
      [12, 16],
      [12, 19], // Midfielders
      [16, 12], // Forward
    ],

    // ... (the rest of the formations)
    '4-4-2': [
      [0, 12], // Goalkeeper
      [4, 9],
      [4, 11],
      [4, 13],
      [4, 15], // Defenders
      [8, 6],
      [8, 8],
      [8, 14],
      [8, 16], // Midfielders
      [12, 10],
      [12, 14], // Forwards
    ],

    '4-3-3': [
      [0, 12], // Goalkeeper
      [4, 9],
      [4, 11],
      [4, 13],
      [4, 15], // Defenders
      [8, 7],
      [8, 11],
      [8, 15], // Midfielders
      [12, 6],
      [12, 12],
      [12, 16], // Forwards
    ],

    '4-2-3-1': [
      [0, 12], // Goalkeeper
      [4, 9],
      [4, 11],
      [4, 13],
      [4, 15], // Defenders
      [8, 8],
      [8, 14], // Defensive Mids
      [12, 6],
      [12, 10],
      [12, 14], // Attacking Mids
      [16, 12], // Forward
    ],

    '4-5-1': [
      [0, 12], // Goalkeeper
      [4, 9],
      [4, 11],
      [4, 13],
      [4, 15], // Defenders
      [8, 5],
      [8, 8],
      [8, 11],
      [8, 14],
      [8, 17], // Midfielders
      [14, 12], // Forward
    ],

    '5-3-2': [
      [0, 12], // Goalkeeper
      [4, 7],
      [4, 9],
      [4, 11],
      [4, 13],
      [4, 15], // Defenders
      [8, 7],
      [8, 12],
      [8, 17], // Midfielders
      [14, 10],
      [14, 14], // Forwards
    ],

    '5-4-1': [
      [0, 12], // Goalkeeper
      [4, 7],
      [4, 9],
      [4, 11],
      [4, 13],
      [4, 15], // Defenders
      [8, 5],
      [8, 8],
      [8, 12],
      [8, 16], // Midfielders
      [14, 12], // Forward
    ],

    '4-3-2-1': [
      [0, 12], // Goalkeeper
      [4, 9],
      [4, 11],
      [4, 13],
      [4, 15], // Defenders
      [8, 7],
      [8, 11],
      [8, 15], // Midfielders
      [12, 8],
      [12, 14], // Attacking Mids
      [16, 12], // Forward
    ],
  };

  // Determine the column and row based on the formation and index
  let [col, row] = formations[formation][index];

  // Adjust column coordinates for field side B
  if (side === 'B') {
    col = 18 + (17 - col); // Mirroring across the center line
  }
  console.log({ side, col, row });

  return { col, row };
};
