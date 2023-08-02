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
  UpdateEventProps,
  WithSenderId,
} from '@explorers-club/schema';
import { assertEntitySchema } from '@explorers-club/utils';
import {
  Formation,
  FormationLiteral,
  LineupCommand,
  LineupContext,
  StrikersSide,
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
                cards: gameEntity.config.cards,
              });

              gameEntity.gameState = {
                ...gameEntity.gameState,
                tilePositionsByCardId,
                homeSideCardIds: homeTeamCardIds,
                awaySideCardIds: awayTeamCardIds,
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
                      text: 'Choose a formation',
                      options: [
                        {
                          name: '4-3-3',
                          value: '4-3-3',
                        },
                        {
                          name: '5-4-1',
                          value: '5-4-1',
                        },
                        {
                          name: '3-4-4',
                          value: '3-4-4',
                        },
                      ],
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

                const isHomeTeam = gameEntity.config.homePlayerIds.includes(
                  strikersPlayer.id
                );

                const newTilePositions: Record<CardId, HexCoordinates> = {};
                if (isHomeTeam) {
                  gameEntity.gameState.homeSideCardIds.map((id, index) => {
                    newTilePositions[id] = getTilePosition({
                      index,
                      formation,
                      side: 'left',
                    });
                  });
                } else {
                  gameEntity.gameState.awaySideCardIds.map((id, index) => {
                    newTilePositions[id] = getTilePosition({
                      index,
                      formation,
                      side: 'right',
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
            MULTIPLE_CHOICE_CONFIRM: [
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

  const teamsByCardId: Record<CardId, StrikersSide> = {};
  const tilePositionsByCardId: Record<CardId, HexCoordinates> = {};

  const defaultFormation = '4-3-3';

  homeCards.forEach((card, index) => {
    teamsByCardId[card.id] = 'home';
    tilePositionsByCardId[card.id] = getTilePosition({
      index,
      formation: defaultFormation,
      side: 'left',
    });
  });
  awayCards.forEach((card, index) => {
    teamsByCardId[card.id] = 'away';
    tilePositionsByCardId[card.id] = getTilePosition({
      index,
      formation: defaultFormation,
      side: 'right',
    });
  });

  const homeTeamCardIds = homeCards.map((card) => card.id);
  const awayTeamCardIds = awayCards.map((card) => card.id);

  return { homeTeamCardIds, awayTeamCardIds, tilePositionsByCardId };
};

/**
 * Given a players "index" in the roster, the further "north"
 * on the field they are and the further closer they are to
 * the opponents goal. Typically you'll see indexes like...
 *
 * 0: GK
 * 1-5: DEF
 * 6-9: MID
 * 10-11; FWD
 *
 * depending on the formation.
 */
const getTilePosition = (props: {
  index: number;
  formation: Formation;
  side: 'left' | 'right';
}): { col: number; row: number } => {
  const { index, formation, side } = props;

  // Define the positions for each formation (4-3-3 in this case)
  const formations: Record<Formation, number[][]> = {
    '4-3-3': [
      [2, 10], // GK
      [5, 6],
      [5, 8],
      [5, 10],
      [5, 12],
      [5, 14], // DEF
      [10, 7],
      [10, 10],
      [10, 13], // MID
      [15, 8],
      [15, 10],
      [15, 12], // FWD
    ],
    '5-4-1': [
      [2, 10], // GK
      [5, 5],
      [5, 7],
      [5, 9],
      [5, 11],
      [5, 13], // DEF
      [10, 6],
      [10, 8],
      [10, 10],
      [10, 12], // MID
      [15, 10], // FWD
    ],
    '3-4-4': [
      [2, 10], // GK
      [5, 8],
      [5, 10],
      [5, 12], // DEF
      [10, 6],
      [10, 8],
      [10, 10],
      [10, 12], // MID
      [15, 7],
      [15, 9],
      [15, 11],
      [15, 13], // FWD
    ],
  };

  let [col, row] = formations[formation][index];

  // If the side is 'right', mirror the col-coordinate
  if (side === 'right') {
    col = 25 - col;
  }

  return { col, row };
};
