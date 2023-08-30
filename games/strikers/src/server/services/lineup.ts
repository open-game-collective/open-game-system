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
import { Hex, HexCoordinates } from 'honeycomb-grid';

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
              const {
                tilePositionsByCardId,
                homeTeamCardIds,
                awayTeamCardIds,
              } = initializeBoard({
                cards: Object.values(gameEntity.config.cardsById),
              });

              const centerCardId = findCenterCardId(
                awayTeamCardIds,
                tilePositionsByCardId
              );

              gameEntity.gameState = {
                ...gameEntity.gameState,
                possession: 'B',
                tilePositionsByCardId,
                sideACardIds: homeTeamCardIds,
                sideBCardIds: awayTeamCardIds,
                ballPosition: tilePositionsByCardId[centerCardId],
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

                const messageEvent = {
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
                };

                gameChannel.next(messageEvent);

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

          const messageEvent = {
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
          };
          gameChannel.next(messageEvent);
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

  const defaultFormation = '3-4-3';

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
  const formations: Record<string, number[][]> = {
    '3-4-3': [
      [0, 12],
      [10, 8],
      [10, 13],
      [10, 18],
      [13, 9],
      [13, 12],
      [13, 15],
      [13, 18],
      [17, 4],
      [17, 12],
      [17, 23],
    ],
    '3-5-2': [
      [0, 12],
      [10, 5],
      [10, 13],
      [10, 20],
      [13, 3],
      [13, 8],
      [13, 12],
      [13, 18],
      [13, 23],
      [17, 9],
      [17, 15],
    ],
    '4-1-4-1': [
      [0, 12],
      [7, 3],
      [7, 8],
      [7, 16],
      [7, 23],
      [10, 12],
      [13, 3],
      [13, 9],
      [13, 12],
      [13, 18],
      [17, 12],
    ],
    '4-4-2': [
      [0, 12],
      [7, 3],
      [7, 8],
      [7, 16],
      [7, 23],
      [10, 3],
      [10, 9],
      [10, 15],
      [10, 23],
      [17, 10],
      [17, 14],
    ],
    '4-3-3': [
      [0, 12],
      [7, 3],
      [7, 12],
      [7, 23],
      [10, 4],
      [10, 9],
      [10, 15],
      [10, 21],
      [17, 6],
      [17, 12],
      [17, 18],
    ],
    '4-2-3-1': [
      [0, 12],
      [10, 3],
      [10, 8],
      [10, 16],
      [10, 23],
      [12, 6],
      [12, 20],
      [15, 3],
      [15, 12],
      [15, 23],
      [17, 12],
    ],
    '4-5-1': [
      [0, 12],
      [11, 7],
      [11, 10],
      [11, 13],
      [11, 16],
      [15, 3],
      [15, 9],
      [15, 12],
      [15, 15],
      [15, 23],
      [17, 12],
    ],
    '5-3-2': [
      [0, 12],
      [10, 7],
      [10, 10],
      [10, 13],
      [10, 16],
      [10, 19],
      [15, 9],
      [15, 12],
      [15, 15],
      [17, 12],
      [17, 14],
    ],
    '5-4-1': [
      [0, 12],
      [10, 6],
      [10, 9],
      [10, 12],
      [10, 15],
      [10, 18],
      [15, 7],
      [15, 12],
      [15, 17],
      [15, 22],
      [17, 12],
    ],
    '4-3-2-1': [
      [0, 12],
      [10, 9],
      [10, 12],
      [10, 15],
      [10, 18],
      [13, 7],
      [13, 13],
      [13, 20],
      [15, 8],
      [15, 16],
      [17, 12],
    ],
  };

  // Determine the column and row based on the formation and index
  let [col, row] = formations[formation][index];

  // Adjust column coordinates for field side B
  if (side === 'B') {
    col = 18 + (17 - col); // Mirroring across the center line
  }

  return { col, row };
};

function findCenterCardId(
  cardIds: string[],
  tilePositionsByCardId: Record<string, HexCoordinates>
) {
  const MID_X = 36 / 2;
  const MID_Y = 26 / 2;

  return cardIds.reduce((closestCardId, currentCardId) => {
    const closestCoord = tilePositionsByCardId[closestCardId];
    const { row, col } = new Hex(closestCoord);
    const closestDistance = Math.sqrt(
      Math.pow(col - MID_X, 2) + Math.pow(row - MID_Y, 2)
    );

    const currentDistance = Math.sqrt(
      Math.pow(col - MID_X, 2) + Math.pow(row - MID_Y, 2)
    );

    return currentDistance < closestDistance ? currentCardId : closestCardId;
  }, cardIds[0]);
}
