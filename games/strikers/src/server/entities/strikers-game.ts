// import { createSchemaIndex, world } from '@explorers-club/api';
import { generateSnowflakeId } from '@api/ids';
import { entitiesById } from '@api/index';
import { waitForCondition } from '@api/world';
import {
  Entity,
  StrikersGameCommand,
  StrikersGameContext,
  WithSenderId,
} from '@explorers-club/schema';
import { assert, assertEntitySchema } from '@explorers-club/utils';
import { Formation } from '@schema/games/strikers';
import type {
  SnowflakeId,
  StrikersFieldSide,
  StrikersGameEventInput,
  StrikersTurnEntity,
} from '@schema/types';
import { deepClone } from 'fast-json-patch';
import { Hex, HexCoordinates } from 'honeycomb-grid';
import { World } from 'miniplex';
import { ReplaySubject } from 'rxjs';
import { DoneInvokeEvent, createMachine } from 'xstate';
import { createLineupMachine } from '../services/lineup';

export const createStrikersGameMachine = ({
  world,
  entity,
  channel,
}: {
  world: World;
  entity: Entity;
  channel: ReplaySubject<any>;
}) => {
  // create grid from game state

  assert(entity.schema === 'strikers_game', 'expected strikers_game entity');
  // const initialBoard = arrangeBoard(entity.config.cards);

  const gameChannel = channel as ReplaySubject<StrikersGameEventInput>;

  return createMachine(
    {
      id: 'StrikersGameMachine',
      type: 'parallel',
      schema: {
        context: {} as StrikersGameContext,
        events: {} as WithSenderId<StrikersGameCommand>,
      },
      context: {
        foo: '',
      },
      states: {
        RunStatus: {
          initial: 'Running',
          states: {
            Running: {},
            Resuming: {},
            Paused: {},
            Error: {},
          },
        },
        PlayStatus: {
          initial: 'Lineup',
          states: {
            Lineup: {
              invoke: {
                id: 'lineupService',
                src: createLineupMachine({
                  gameChannel,
                  gameEntity: entity,
                }),
                autoForward: true,
                onDone: {
                  target: 'Regulation',
                  actions: (
                    context,
                    event: DoneInvokeEvent<{
                      formationsByPlayerId: Record<SnowflakeId, Formation>;
                    }>
                  ) => {
                    // todo set board using data from lineup
                  },
                },
              },
            },
            Regulation: {
              initial: 'FirstHalf',
              states: {
                FirstHalf: {
                  initial: 'NormalTime',
                  states: {
                    NormalTime: {
                      entry: ['placeStartingPossession'],
                      invoke: {
                        src: 'runTurn',
                        onDone: [
                          {
                            target: 'NormalTime',
                            cond: 'hasTimeRemainingInHalf',
                          },
                          {
                            target: 'StoppageTime',
                          },
                        ],
                      },
                    },
                    StoppageTime: {
                      invoke: {
                        src: 'runTurn',
                        onDone: [
                          {
                            target: 'StoppageTime',
                            cond: 'hasStoppageTimeRemaining',
                          },
                          {
                            target: 'Complete',
                          },
                        ],
                      },
                    },
                    Complete: {
                      type: 'final',
                    },
                  },
                },
                Halftime: {
                  on: {
                    START: 'SecondHalf',
                  },
                },
                SecondHalf: {
                  initial: 'NormalTime',
                  states: {
                    NormalTime: {
                      invoke: {
                        src: 'runTurn',
                        onDone: [
                          {
                            target: 'NormalTime',
                            cond: 'hasTimeRemainingInHalf',
                          },
                          {
                            target: 'StoppageTime',
                          },
                        ],
                      },
                    },
                    StoppageTime: {
                      invoke: {
                        src: 'runTurn',
                        onDone: [
                          {
                            target: 'StoppageTime',
                            cond: 'hasStoppageTimeRemaining',
                          },
                          {
                            target: 'Complete',
                          },
                        ],
                      },
                    },
                    Complete: {
                      type: 'final',
                    },
                  },
                },
              },
            },
            ExtraTime: {},
          },
        },
        GameOver: {
          type: 'final',
        },
      },
      predictableActionArguments: true,
    },
    {
      actions: {
        placeStartingPossession: (context, event, meta) => {
          const { gameState } = entity;
          const centerCardId = findCenterCardId(
            gameState.possession === 'A'
              ? gameState.sideACardIds
              : gameState.sideBCardIds,
            gameState.tilePositionsByCardId
          );

          const MIDFIELD_B = { col: 18, row: 13 };
          // default to away team, can add logic later
          entity.gameState = {
            ...gameState,
            ballPosition: gameState.tilePositionsByCardId[centerCardId],
          };
        },
      },
      guards: {
        hasTimeRemainingInHalf: (context, event, meta) => {
          // todo
          // returns true if the # of turns played are less than the config specified turns per half
          return true;
        },
        hasStoppageTimeRemaining: (context, event, meta) => {
          // todo
          // returns true if the # of turns played are less than the half + the stoppageTime added minutes
          return true;
        },
      },
      services: {
        runTurn: async (_, event) => {
          // todo for resumes we might need to conditionally create the turn
          // and store a reference to the current turn Id
          const { createEntity } = await import('@api/ecs');

          const index = entity.turnsIds.length % 2;
          let side: StrikersFieldSide = index === 0 ? 'B' : 'A';

          const playerId = entity.config.playerIds[index];
          assert(playerId, 'expected playerId but not foudn');

          const turnEntity = createEntity<StrikersTurnEntity>({
            schema: 'strikers_turn',
            startedAt: new Date(),
            gameEntityId: entity.id,
            side,
            playerId,
            totalActionCount: entity.config.gameplaySettings.actionsPerTurn,
            stagedGameState: deepClone(entity.gameState), // todo might need to deep cline?
            modifiers: [],
            effectsIds: [],
          });
          world.add(turnEntity);
          entity.turnsIds = [...entity.turnsIds, turnEntity.id];

          const playerEntity = entitiesById.get(playerId);
          assertEntitySchema(playerEntity, 'strikers_player');
          const userEntity = entitiesById.get(playerEntity.userId);
          assertEntitySchema(userEntity, 'user');

          // maybe we dont need to do this?
          // or maybe this is how we will send private state / message
          userEntity.send({
            type: 'ENTER_CHANNEL',
            channelId: turnEntity.id,
          });

          const id = generateSnowflakeId();

          const messageEvent = {
            id,
            type: 'MESSAGE',
            contents: [
              {
                type: 'TurnStarted',
                turnId: turnEntity.id,
                timestamp: new Date(),
              },
            ],
            senderId: entity.id,
          };

          gameChannel.next(messageEvent);

          await waitForCondition(
            turnEntity,
            (entity) => entity.states.Status === 'Complete'
          );
        },
      },
    }
  );
};

// const arrangePlayers = ({
//   cards,
//   homeFormation,
//   awayFormation,
//   homeSide,
// }: {
//   cards: StrikersCard[];
//   homeFormation: Formation;
//   awayFormation: Formation;
//   homeSide: 'WEST' | 'EAST';
// }) => {
//   // Shuffle the cards to ensure randomness
//   cards.sort(() => Math.random() - 0.5);

//   const cardsById: Record<StrikersCard['id'], StrikersCard> = {};
//   cards.forEach((card) => (cardsById[card.id] = card));

//   // Initialize empty lists for each position
//   const homeTeam: StrikersCard[] = [];
//   const awayTeam: StrikersCard[] = [];

//   // Distribute the cards to each team
//   for (const card of cards) {
//     const positionCount = (team: StrikersBoardCard[], position: string) =>
//       team.filter(
//         (playerCard) => cardsById[playerCard.cardId].rosterPosition === position
//       ).length;

//     if (
//       positionCount(homeTeam, card.rosterPosition) <
//       (card.rosterPosition === 'GK' ? 1 : card.rosterPosition === 'DEF' ? 4 : 3)
//     ) {
//       homeTeam.push({
//         team: 'home',
//         cardId: card.id,
//         stamina: card.endurance,
//         tilePosition: getTilePositionForPlayer(
//           card.rosterPosition,
//           'home',
//           positionCount(homeTeam, card.rosterPosition)
//         ),
//       });
//     } else if (
//       positionCount(awayTeam, card.rosterPosition) <
//       (card.rosterPosition === 'GK' ? 1 : card.rosterPosition === 'DEF' ? 4 : 3)
//     ) {
//       awayTeam.push({
//         team: 'away',
//         cardId: card.id,
//         stamina: card.endurance,
//         tilePosition: getTilePositionForPlayer(
//           card.rosterPosition,
//           'away',
//           positionCount(awayTeam, card.rosterPosition)
//         ),
//       });
//     }
//   }

//   return [...homeTeam, ...awayTeam];
// };

// function getTilePositionForPlayer(
//   position: StrikersPlayerPosition,
//   team: StrikersTeam,
//   playerIndex: number
// ): [number, number] {
//   // Define the column for each position and team
//   const columns = {
//     home: {
//       GK: 0,
//       DEF: 1,
//       MID: 3,
//       FWD: 5,
//     },
//     away: {
//       GK: 12,
//       DEF: 10,
//       MID: 8,
//       FWD: 7,
//     },
//   } as const;

//   // The row for the player depends on their index within their position group
//   const row = playerIndex * 2; // assuming 2 spaces between each player in a column

//   return [columns[team][position], row];
// }

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
