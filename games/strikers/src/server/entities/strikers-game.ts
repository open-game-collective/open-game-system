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
import type {
  CreateEventProps,
  StrikersBoard,
  StrikersBoardCard,
  StrikersCard,
  StrikersGameEvent,
  StrikersGameStateValue,
  StrikersPlayerPosition,
  StrikersTeam,
  StrikersTurnEntity,
} from '@schema/types';
import { World } from 'miniplex';
import { ReplaySubject } from 'rxjs';
import { createMachine } from 'xstate';

export const createStrikersGameMachine = ({
  world,
  entity,
  channel,
}: {
  world: World;
  entity: Entity;
  channel: ReplaySubject<any>;
}) => {
  assert(entity.schema === 'strikers_game', 'expected strikers_game entity');
  const initialBoard = initializeBoard(entity.config.cards);

  const gameChannel = channel as ReplaySubject<
    CreateEventProps<StrikersGameEvent>
  >;

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
          initial: 'Regulation',
          states: {
            Regulation: {
              initial: 'FirstHalf',
              states: {
                FirstHalf: {
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
      guards: {
        hasTimeRemainingInHalf: (context, event, meta) => {
          const stateValue = meta.state.value as StrikersGameStateValue;
          stateValue.PlayStatus.Regulation.FirstHalf === 'NormalTime';
          return true;
        },
        hasStoppageTimeRemaining: (context, event, meta) => {
          console.log(meta);
          // calcaulte based off # of turns played
          return true;
        },
      },
      services: {
        runTurn: async (_, event) => {
          // todo for resumes we might need to conditionally create the turn
          // and store a reference to the current turn Id
          const { createEntity } = await import('@api/ecs');

          const index = entity.turnsIds.length % 2;
          const playerId = entity.config.playerIds[index];
          assert(playerId, 'expected playerId but not foudn');

          const turnEntity = createEntity<StrikersTurnEntity>({
            schema: 'strikers_turn',
            startedAt: new Date(),
            side: 'home',
            playerId,
            totalActionCount: entity.config.gameplaySettings.actionsPerTurn,
            modifiers: [],
            effects: [],
          });
          world.add(turnEntity);
          entity.turnsIds.push(turnEntity.id);

          const playerEntity = entitiesById.get(playerId);
          assertEntitySchema(playerEntity, 'strikers_player');
          const userEntity = entitiesById.get(playerEntity.userId);
          assertEntitySchema(userEntity, 'user');
          console.log({ userEntity });

          userEntity.send({
            type: 'ENTER_CHANNEL',
            channelId: turnEntity.id,
          });

          const id = generateSnowflakeId();

          gameChannel.next({
            id,
            type: 'MESSAGE',
            // recipientId: turnEntity.playerId,
            contents: [
              {
                type: 'TurnStarted',
                turnId: turnEntity.id,
                timestamp: new Date(),
              },
            ],
            senderId: entity.id,
          });

          // todo here is where we want do so something with the message id
          // that was just created
          // we need to take it and listen for events
          // example, MOVE

          await waitForCondition(
            turnEntity,
            (entity) => entity.states.Status === 'Complete'
          );
        },
      },
    }
  );
};

// const waitUntilMatches = <TEntity extends Entity>(entity: TEntity, 0timeout?: number ) => {
//   return new Promise((resolve) => {

//   })
// }

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
        stamina: card.endurance,
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
        stamina: card.endurance,
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
