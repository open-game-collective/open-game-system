import {
  channelObservablesById,
  channelSubjectsById,
  entitiesById,
  generateSnowflakeId,
} from '@api/index';
import {
  Entity,
  StrikersEffectEntity,
  WithSenderId,
} from '@explorers-club/schema';
import {
  assert,
  assertEntitySchema,
  assertEventType,
} from '@explorers-club/utils';
import { CardId } from '@schema/game-configuration/strikers';
import {
  StrikersAction,
  StrikersActionSchema,
  AlphaNumCoordinatesSchema,
} from '@schema/games/strikers';
import {
  BlockCommand,
  StrikersFieldSide,
  StrikersGameEntity,
  StrikersGameEvent,
  StrikersGameEventInput,
  StrikersGameState,
  StrikersTurnCommand,
  StrikersTurnContext,
  StrikersTurnEntity,
} from '@schema/types';
import { alphaNumToOffsetCoordiantes } from '@strikers/lib/utils';
import { offsetToStrikersTile } from '@strikers/utils';
import { assign } from '@xstate/immer';
import { compare } from 'fast-json-patch';
import {
  CubeCoordinates,
  Direction,
  Grid,
  Hex,
  HexCoordinates,
  isOffset,
  isTuple,
  line,
  rectangle,
  spiral,
  tupleToCube,
} from 'honeycomb-grid';
import { produce } from 'immer';
import { World } from 'miniplex';
import { Observable, ReplaySubject } from 'rxjs';
import { createMachine } from 'xstate';
import { z } from 'zod';
import * as effects from '../effects';

const grid = new Grid(Hex, rectangle({ width: 36, height: 26 }));

export const createStrikersTurnMachine = ({
  world,
  entity,
}: {
  world: World;
  entity: Entity;
}) => {
  assertEntitySchema(entity, 'strikers_turn');
  const gameChannelSubject = channelSubjectsById.get(entity.gameEntityId) as
    | ReplaySubject<StrikersGameEventInput>
    | undefined;
  assert(gameChannelSubject, 'expected gameChannelSubject but not found');

  const gameChannelObservable = channelObservablesById.get(
    entity.gameEntityId
  ) as Observable<StrikersGameEvent> | undefined;
  assert(gameChannelObservable, 'expected gameChannelObservable but not found');

  const gameEntity = entitiesById.get(entity.gameEntityId);
  assertEntitySchema(gameEntity, 'strikers_game');

  const messagesById = new Map();
  gameChannelObservable.subscribe((event) => {
    messagesById.set(event.id, event);
  });

  return createMachine(
    {
      id: 'StrikersTurnMachine',
      type: 'parallel',
      schema: {
        context: {} as StrikersTurnContext,
        events: {} as WithSenderId<StrikersTurnCommand>,
      },
      context: {
        actionMessageIds: [],
      },
      states: {
        Status: {
          initial: 'Actions',
          states: {
            Actions: {
              initial: 'SendingSelectActionMessage',
              onDone: 'Complete',
              states: {
                SendingSelectActionMessage: {
                  invoke: {
                    src: 'sendSelectActionMessage',
                    onDone: {
                      target: 'InputtingAction',
                      actions: assign((context, event) => {
                        context.actionMessageIds.push(event.data);
                      }),
                    },
                  },
                },
                InputtingAction: {
                  initial: 'Unselected',
                  onDone: [
                    {
                      target: 'SendingSelectActionMessage',
                      cond: 'hasActionsRemaining',
                    },
                    {
                      target: 'Complete',
                    },
                  ],
                  states: {
                    Unselected: {
                      on: {
                        MULTIPLE_CHOICE_SELECT: [
                          {
                            target: 'Moving',
                            cond: 'didSelectMoveAction',
                          },
                          {
                            target: 'Shooting',
                            cond: 'didSelectShootAction',
                          },
                          {
                            target: 'Passing',
                            cond: 'didSelectPassAction',
                          },
                        ],
                      },
                    },
                    Moving: {
                      initial: 'SendingPlayerSelectMessage',
                      exit: 'clearSelections',
                      on: {
                        MULTIPLE_CHOICE_SELECT: [
                          {
                            target: 'Shooting',
                            cond: 'didSelectShootAction',
                          },
                          {
                            target: 'Passing',
                            cond: 'didSelectPassAction',
                          },
                        ],
                      },
                      states: {
                        SendingPlayerSelectMessage: {
                          invoke: {
                            src: 'sendPlayerSelectMessage',
                            onDone: 'InputtingPlayer',
                          },
                        },
                        InputtingPlayer: {
                          initial: 'Unselected',
                          onDone: 'Complete',
                          states: {
                            Unselected: {
                              on: {
                                MULTIPLE_CHOICE_SELECT: {
                                  target: 'PlayerSelected',
                                  actions: [
                                    'assignSelectedCardId',
                                    'sendCardSelectedEvent',
                                  ],
                                  cond: 'didSelectPlayerTarget',
                                },
                              },
                            },
                            PlayerSelected: {
                              initial: 'SendingTargetSelectMessage',
                              states: {
                                SendingTargetSelectMessage: {
                                  invoke: {
                                    src: 'sendTargetSelectMessage',
                                    onDone: 'InputtingTarget',
                                    meta: {
                                      action: 'MOVE',
                                    } satisfies SendTargetSelectMessageMeta,
                                  },
                                },
                                InputtingTarget: {
                                  on: {
                                    MULTIPLE_CHOICE_SELECT: [
                                      {
                                        target: 'SendingTargetSelectMessage',
                                        actions: [
                                          'clearLastMessage',
                                          'assignSelectedCardId',
                                          'sendCardSelectedEvent',
                                        ],
                                        cond: 'didSelectPlayerTarget',
                                      },
                                      {
                                        target: 'Ready',
                                        actions: [
                                          'assignSelectedTarget',
                                          'sendMoveTargetSelectedEvent',
                                        ],
                                        cond: 'didSelectMoveTarget',
                                      },
                                    ],
                                  },
                                },
                                Ready: {
                                  on: {
                                    CONFIRM: {
                                      target: 'Submitting',
                                    },
                                  },
                                },
                                Submitting: {
                                  invoke: {
                                    src: 'createMoveEffect',
                                    onDone: 'Complete',
                                    onError: 'Error',
                                  },
                                },
                                Error: {
                                  entry: console.error,
                                },
                                Complete: {
                                  entry: 'finalizeActionMessage',
                                  type: 'final',
                                },
                              },
                              onDone: 'Complete',
                            },
                            Complete: {
                              type: 'final',
                            },
                          },
                        },
                        Complete: {
                          type: 'final',
                        },
                      },
                      onDone: 'Complete',
                    },
                    Passing: {
                      exit: 'clearSelections',
                      on: {
                        MULTIPLE_CHOICE_SELECT: [
                          {
                            target: 'Moving',
                            cond: 'didSelectMoveAction',
                          },
                          {
                            target: 'Shooting',
                            cond: 'didSelectShootAction',
                          },
                        ],
                      },
                      initial: 'SendingTargetSelectMessage',
                      states: {
                        SendingTargetSelectMessage: {
                          invoke: {
                            src: 'sendTargetSelectMessage',
                            onDone: 'InputtingTarget',
                            meta: {
                              action: 'PASS',
                            } satisfies SendTargetSelectMessageMeta,
                          },
                        },
                        InputtingTarget: {
                          on: {
                            MULTIPLE_CHOICE_SELECT: {
                              target: 'Ready',
                              actions: 'assignSelectedTarget',
                              cond: (_, event) => event.blockIndex == 1,
                            },
                          },
                        },
                        Ready: {
                          on: {
                            CONFIRM: {
                              actions: () => {
                                console.log('CONFIRM!');
                              },
                              target: 'Submitting',
                            },
                          },
                        },
                        Submitting: {
                          invoke: {
                            src: 'createPassEffect',
                            onDone: 'Complete',
                            onError: 'Error',
                          },
                        },
                        Error: {},
                        Complete: {
                          type: 'final',
                        },
                        // Complete: {
                        //   initial: 'Submitting',
                        //   states: {
                        //     Submitting: {
                        //       invoke: {
                        //         src: async () => {
                        //           console.log('HELLO!!!!');
                        //         },
                        //         onDone: 'Complete',
                        //         onError: 'Error',
                        //       },
                        //     },
                        //     Error: {},
                        //     Complete: {
                        //       type: 'final',
                        //     },
                        //   },
                        //   type: 'final',
                        // },
                      },
                    },
                    Shooting: {
                      exit: 'clearSelections',
                      on: {
                        MULTIPLE_CHOICE_SELECT: [
                          {
                            target: 'Moving',
                            cond: 'didSelectMoveAction',
                          },
                          {
                            target: 'Passing',
                            cond: 'didSelectPassAction',
                          },
                        ],
                      },
                      initial: 'Ready',
                      states: {
                        Ready: {
                          on: {
                            CONFIRM: {
                              target: 'Complete',
                            },
                          },
                        },
                        Complete: {
                          initial: 'Submitting',
                          states: {
                            Submitting: {
                              invoke: {
                                src: 'createShotEffect',
                                onDone: 'Complete',
                                onError: 'Error',
                              },
                            },
                            Error: {},
                            Complete: {
                              type: 'final',
                            },
                          },
                          type: 'final',
                        },
                      },
                    },
                    Complete: {
                      type: 'final',
                    },
                  },
                },
                Complete: {
                  type: 'final',
                },
              },
            },
            Complete: {
              type: 'final',
            },
          },
        },
      },
    },
    {
      actions: {
        sendMoveTargetSelectedEvent: ({ selectedTarget }) => {
          // todo... only send to player whos turn it currently is?
          assert(
            selectedTarget,
            'expected selectedTarget when sending move event'
          );
          // todo... only send to player whos turn it currently is?
          // assert(selectedCardId, 'expected selectedCardId when sending event');

          // const playerId =
          //   entity.side === 'A'
          //     ? gameEntity.config.homeTeamPlayerIds[0]
          //     : gameEntity.config.awayTeamPlayerIds[0];
          // const playerEntity = entitiesById.get(playerId);
          // assertEntitySchema(playerEntity, 'strikers_player');

          const event = {
            type: 'SELECT_MOVE_TARGET' as const,
            target: selectedTarget,
          };
          gameChannelSubject.next(event);
        },
        sendCardSelectedEvent: ({ selectedCardId }) => {
          // todo... only send to player whos turn it currently is?
          assert(selectedCardId, 'expected selectedCardId when sending event');

          const playerId =
            entity.side === 'A'
              ? gameEntity.config.homeTeamPlayerIds[0]
              : gameEntity.config.awayTeamPlayerIds[0];
          const playerEntity = entitiesById.get(playerId);
          assertEntitySchema(playerEntity, 'strikers_player');

          const event = {
            type: 'SELECT_CARD' as const,
            cardId: selectedCardId,
            recipientId: playerEntity.userId,
          };

          gameChannelSubject.next(event);
        },

        assignSelectedCardId: assign((context, event) => {
          assertEventType(event, 'MULTIPLE_CHOICE_SELECT');
          context.selectedCardId = event.value;
        }),

        assignSelectedTarget: assign((context, event) => {
          assertEventType(event, 'MULTIPLE_CHOICE_SELECT');
          const target = AlphaNumCoordinatesSchema.parse(event.value);
          context.selectedTarget = target;
        }),

        clearLastMessage: assign((context) => {
          const messageId =
            context.actionMessageIds[context.actionMessageIds.length - 1];
          const message = messagesById.get(messageId);
          delete context.selectedCardId;
          const messageEvent = {
            id: messageId,
            type: 'MESSAGE',
            contents: message.contents.slice(0, -1),
          };

          gameChannelSubject.next(messageEvent);
        }),

        // Resets the current action message to be the first message
        clearSelections: assign((context) => {
          // Only clear the message if the effect hasn't been created yet
          // This action gets called anytime we exist
          const actionEffectCount = getActionEffectCount({ entity });
          const actionMessageCount = context.actionMessageIds.length;

          if (actionEffectCount < actionMessageCount) {
            const messageId =
              context.actionMessageIds[context.actionMessageIds.length - 1];
            const message = messagesById.get(messageId);
            delete context.selectedCardId;

            const messageEvent = {
              id: messageId,
              type: 'MESSAGE',
              contents: [message.contents[0]],
            };
            console.log(messageEvent.contents[0]);
            gameChannelSubject.next(messageEvent);
          }
        }),
        finalizeActionMessage: ({ actionMessageIds }) => {
          const messageId = actionMessageIds[actionMessageIds.length - 1];
          const messageEvent = {
            id: messageId,
            type: 'MESSAGE',
            contents: [
              {
                type: 'PlainMessage',
                message: `Player 7 moved A.Qui #78 to #13`,
              },
              // {
              //   type: 'PlainMessage',
              //   message: `[]`,
              // },
            ],
          };
          gameChannelSubject.next(messageEvent);
        },
      },
      services: {
        createMoveEffect: async ({ selectedCardId, selectedTarget }) => {
          assert(selectedCardId, 'expected selectedCardId');
          assert(selectedTarget, 'expected selectedTarget');
          const toPosition = alphaNumToOffsetCoordiantes(selectedTarget);

          const fromPosition =
            gameEntity.gameState.tilePositionsByCardId[selectedCardId];

          // If the moving player possessions the ball, move the ball when the player moves
          let ballPosition = gameEntity.gameState.ballPosition;
          const movingPlayerHasBall =
            ballPosition === fromPosition &&
            gameEntity.gameState.possession === entity.side;
          if (movingPlayerHasBall) {
            ballPosition = toPosition;
          }

          const nextGameState = produce(gameEntity.gameState, (draft) => {
            draft.ballPosition = ballPosition;
            draft.tilePositionsByCardId = {
              ...draft.tilePositionsByCardId,
              [selectedCardId]: toPosition,
            };
          });
          const patches = compare(gameEntity.gameState, nextGameState);

          const { createEntity } = await import('@api/ecs');
          const effectEntity = createEntity<StrikersEffectEntity>({
            schema: 'strikers_effect',
            patches,
            gameId: gameEntity.id,
            turnId: entity.id,
            category: 'ACTION',
            data: {
              type: 'MOVE',
              cardId: selectedCardId,
              fromPosition,
              toPosition,
            },
          });
          world.add(effectEntity);
          entity.effectsIds.push(effectEntity.id);
          gameEntity.gameState = nextGameState;

          return entity;
        },

        createShotEffect: async () => {
          const { gameState } = gameEntity;

          const nextGameState = produce(gameState, (draft) => {
            // draft.ballPosition = toPosition;
            // todo how to handle changing ball position
          });
          const patches = compare(gameEntity.gameState, nextGameState);
          const fromCardId = getCardIdWithPossession(gameState);
          assert(fromCardId, 'expected fromCardid');

          const fromPosition = gameState.tilePositionsByCardId[fromCardId];

          const { createEntity } = await import('@api/ecs');
          const effectEntity = createEntity<StrikersEffectEntity>({
            schema: 'strikers_effect',
            patches,
            turnId: entity.id,
            gameId: gameEntity.id,
            category: 'ACTION',
            data: {
              type: 'SHOOT',
              fromCardId,
              fromPosition,
            },
          });
          world.add(effectEntity);
          entity.effectsIds.push(effectEntity.id);
          gameEntity.gameState = nextGameState;

          return entity;
        },
        createPassEffect: async ({ selectedTarget }) => {
          assert(selectedTarget, 'expected selectedTarget');
          const toPosition = alphaNumToOffsetCoordiantes(selectedTarget);

          const fromCardId = getCardIdWithPossession(gameEntity.gameState);
          assert(fromCardId, 'expected fromCardId when creating pass effect');

          const fromPosition = gameEntity.gameState.ballPosition;
          assert(
            fromPosition,
            'expected fromPosition when creating pass effect'
          );
          assert(
            gameEntity.gameState.possession,
            'expected team to have possession when creating pass effect'
          );

          const toCardId = getCardIdAtPositionOnTeam(
            gameEntity.gameState,
            toPosition,
            gameEntity.gameState.possession
          );

          const nextGameState = produce(gameEntity.gameState, (draft) => {
            draft.ballPosition = toPosition;
          });
          const patches = compare(gameEntity.gameState, nextGameState);

          const { createEntity } = await import('@api/ecs');
          const effectEntity = createEntity<StrikersEffectEntity>({
            schema: 'strikers_effect',
            patches,
            turnId: entity.id,
            gameId: gameEntity.id,
            category: 'ACTION',
            data: {
              type: 'PASS',
              fromCardId,
              fromPosition,
              toPosition,
              toCardId,
            },
          });
          world.add(effectEntity);
          entity.effectsIds.push(effectEntity.id);
          gameEntity.gameState = nextGameState;

          return entity;
        },

        sendSelectActionMessage: async () => {
          const { side } = entity;
          const playerId =
            entity.side === 'A'
              ? gameEntity.config.homeTeamPlayerIds[0]
              : gameEntity.config.awayTeamPlayerIds[0];
          const playerEntity = entitiesById.get(playerId);
          assertEntitySchema(playerEntity, 'strikers_player');

          const id = generateSnowflakeId();

          const availableActions = getAvailableActions({
            gameEntity,
            side,
          });
          const actionCount = getActionEffectCount({ entity });

          const remainingActionCount =
            entity.totalActionCount - actionCount + 1;

          const messageEvent = {
            id,
            type: 'MESSAGE',
            recipientId: playerEntity.userId,
            responderId: entity.id,
            contents: [
              {
                type: 'MultipleChoice',
                text: `Select an action (${remainingActionCount} remaining)`,
                options: availableActions.map((action) => {
                  return {
                    name: actionNames[action],
                    value: action,
                  };
                }),
              },
            ],
          };
          gameChannelSubject.next(messageEvent);

          return id;
        },
        sendPlayerSelectMessage: async (context, event, invokeMeta) => {
          const messageId =
            context.actionMessageIds[context.actionMessageIds.length - 1];

          const message = messagesById.get(messageId);
          const cardIds =
            entity.side === 'A'
              ? gameEntity.gameState.sideACardIds
              : gameEntity.gameState.sideBCardIds;

          const contents = [
            ...message.contents,
            {
              type: 'MultipleChoice',
              text: 'Select player to move',
              options: cardIds.map((cardId) => {
                const card = gameEntity.config.cardsById[cardId];
                return {
                  name: `${card.abbreviation} #${card.jerseyNum}`,
                  value: cardId,
                };
              }),
            },
          ];

          const messageEvent = {
            id: messageId,
            type: 'MESSAGE',
            contents,
          };

          gameChannelSubject.next(messageEvent);
        },
        sendTargetSelectMessage: async (context, event, { meta }) => {
          const { action } = SendTargetSelectMessageMetaSchema.parse(meta);
          const messageId =
            context.actionMessageIds[context.actionMessageIds.length - 1];

          const message = messagesById.get(messageId);

          let text: string;
          let targets: HexCoordinates[];

          if (action === 'PASS') {
            text = 'Select pass destination';
            targets = getPassTargets({
              gameEntity,
            });
          } else {
            const { selectedCardId } = context;

            assert(
              selectedCardId,
              'expected cardId when sending move target message'
            );
            const card = gameEntity.config.cardsById[selectedCardId];

            text = `Select destination for ${card.abbreviation}`;
            targets = getMoveTargets({
              cardId: selectedCardId,
              gameEntity,
            });
          }

          const block = {
            type: 'MultipleChoice',
            showConfirm: true,
            text,
            options: targets.map((target) => {
              const tile = offsetToStrikersTile(new Hex(target));
              return {
                name: tile,
                value: tile,
              };
            }),
          } as const;

          const contents = [...message.contents, block];

          const messageEvent = {
            id: messageId,
            type: 'MESSAGE',
            contents,
          };

          gameChannelSubject.next(messageEvent);
        },
      },
      guards: {
        didSelectPlayerTarget: (_, event) => {
          return event.blockIndex === 1;
        },
        didSelectMoveTarget: (_, event) => {
          assertEventType(event, 'MULTIPLE_CHOICE_SELECT');
          return event.blockIndex === 2;
        },
        didSelectPassAction: (_, event, meta) => {
          assertEventType(event, 'MULTIPLE_CHOICE_SELECT');

          if (event.blockIndex !== 0) {
            return false;
          }

          const action = getSelectedAction(event);
          return action === 'PASS';
        },
        didSelectMoveAction: (_, event, meta) => {
          assertEventType(event, 'MULTIPLE_CHOICE_SELECT');

          if (event.blockIndex !== 0) {
            return false;
          }

          const action = getSelectedAction(event);
          return action === 'MOVE';
        },
        didSelectShootAction: (_, event, meta) => {
          assertEventType(event, 'MULTIPLE_CHOICE_SELECT');

          if (event.blockIndex !== 0) {
            return false;
          }

          const action = getSelectedAction(event);
          return action === 'SHOOT';
        },
        hasActionsRemaining: () => {
          const actionCount = getActionEffectCount({ entity });
          return actionCount < entity.totalActionCount;
        },
      },
    }
  );
};

const getActionEffectCount = (props: { entity: StrikersTurnEntity }) => {
  const entities = props.entity.effectsIds
    .map((id) => entitiesById.get(id))
    .filter((entity) => {
      assertEntitySchema(entity, 'strikers_effect');
      return entity.category === 'ACTION';
    });
  return entities.length;
};

const effectMachineMap = {
  MOVE: effects.createMoveActionMachine,
  PASS: effects.createPassActionMachine,
  SHOOT: effects.createShootActionMachine,
  INTERCEPT_ATTEMPT: effects.createInterceptionAttemptMachine,
  TACKLE_ATTEMPT: effects.createTackleAttemptMachine,
} as const;

function rollTwentySidedDie(): number {
  return Math.floor(Math.random() * 20) + 1;
}

/**
 * @returns the list of actions that the player can take
 * one of {MOVE, PASS, SHOOT}
 */
const getAvailableActions = ({
  gameEntity,
  side,
}: {
  gameEntity: StrikersGameEntity;
  side: StrikersFieldSide;
}) => {
  // moving is always possible
  const actions: StrikersAction[] = ['MOVE'];

  // The team with the ball can always pass
  if (gameEntity.gameState.possession === side) {
    actions.push('PASS');
  }

  // shooting is only possible if the player with the ball
  // has a non-zero chance to store.
  if (canShoot(gameEntity, side)) {
    actions.push('SHOOT');
  }

  return actions;
};

const canShoot = (
  gameEntity: StrikersGameEntity,
  fieldSide: StrikersFieldSide
) => {
  const { gameState } = gameEntity;
  const { possession } = gameState;

  // if the specified side doesn't currently have possession
  if (fieldSide !== possession) {
    return false;
  }

  const shooter = getCardIdWithPossession(gameState);
  if (!shooter) {
    return;
  }

  const rollNeeded = getRollNeededToScore(gameState);
  return !!rollNeeded;
};

/**
 * Given a game state, returns the roll needed in order
 * for the player with the he ball to be able to score
 * on a shot
 *
 * Returns undefined if the player cannot score.
 */
const getRollNeededToScore: (
  gameState: StrikersGameState
) => number | undefined = (gameState) => {
  const shooter = getCardIdWithPossession(gameState);

  // todo calculate based on distance to goal
  return undefined;
};

// /**
//  * Given a cardId, returns the list of tile directions
//  * that that card can move to. One of
//  */
// export const getMoveTargets: (props: {
//   gameEntity: StrikersGameEntity;
//   playerEntity: StrikersPlayerEntity;
//   cardId: string;
// }) => PointyDirection[] = (props: {}) => {
//   // todo implement
//   return "NE"
// };

const actionNames: Record<StrikersAction, string> = {
  MOVE: 'Move',
  PASS: 'Pass',
  SHOOT: 'Shoot',
};

const getSelectedAction = (event: BlockCommand) => {
  assertEventType(event, 'MULTIPLE_CHOICE_SELECT');

  return StrikersActionSchema.parse(event.value);
};

const getCurrentSelectedAction = (entity: StrikersTurnEntity) => {
  if (typeof entity.states.Status === 'object') {
    if (typeof entity.states.Status.Actions === 'object') {
      if (typeof entity.states.Status.Actions.InputtingAction === 'object') {
        if (entity.states.Status.Actions.InputtingAction.Moving) {
          return 'MOVE';
        }
        if (entity.states.Status.Actions.InputtingAction.Shooting) {
          return 'SHOOT';
        }
        if (entity.states.Status.Actions.InputtingAction.Passing) {
          return 'PASS';
        }
      }
    }
  }
  return undefined;
};

const getMoveTargets: (props: {
  cardId: CardId;
  gameEntity: StrikersGameEntity;
}) => HexCoordinates[] = (props) => {
  const start = props.gameEntity.gameState.tilePositionsByCardId[props.cardId];
  assert(start, 'expected to find position for cardId +' + props.cardId);

  const targets = grid.traverse(spiral({ radius: 1, start }));
  const out = targets.toArray().map((f) => {
    return [f.row, f.col, offsetToStrikersTile(f)];
  });
  return targets.toArray();
};

const getCardIdWithPossession = (state: StrikersGameState) => {
  if (!state.possession || !state.ballPosition) {
    return undefined;
  }

  return getCardIdAtPositionOnTeam(state, state.ballPosition, state.possession);
};

const getCardIdAtPositionOnTeam = (
  state: StrikersGameState,
  position: HexCoordinates,
  side: StrikersFieldSide
) => {
  const cardIds = side === 'A' ? state.sideACardIds : state.sideBCardIds;
  return cardIds.find((cardId) => {
    return equals(state.tilePositionsByCardId[cardId], position);
  });
};

// Deduplicate function

const getPassTargets = ({ gameEntity }: { gameEntity: StrikersGameEntity }) => {
  const { gameState } = gameEntity;
  const { possession } = gameState;
  const { sideACardIds, sideBCardIds } = gameState;
  const possessionCardId = getCardIdWithPossession(gameEntity.gameState);
  const cardIds = possession === 'A' ? sideACardIds : sideBCardIds;

  if (!possessionCardId || !cardIds.includes(possessionCardId)) {
    return [];
  }

  const cardWithPossessionPosition =
    gameState.tilePositionsByCardId[possessionCardId];
  assert(
    cardWithPossessionPosition,
    'expected card with posession to have a position'
  );

  const targetPositions = cardIds.reduce((set, cardId) => {
    set.add(gameState.tilePositionsByCardId[cardId]);
    return set;
  }, new Set<HexCoordinates>());

  grid
    .traverse([
      line({
        start: cardWithPossessionPosition,
        direction: Direction.NE,
        length: 6,
      }),
      line({
        start: cardWithPossessionPosition,
        direction: Direction.NW,
        length: 6,
      }),
      line({
        start: cardWithPossessionPosition,
        direction: Direction.SE,
        length: 6,
      }),
      line({
        start: cardWithPossessionPosition,
        direction: Direction.SW,
        length: 6,
      }),
      line({
        start: cardWithPossessionPosition,
        direction: Direction.W,
        length: 6,
      }),
      line({
        start: cardWithPossessionPosition,
        direction: Direction.E,
        length: 6,
      }),
    ])
    .forEach((hex) => {
      targetPositions.add(hex);
    });

  return [...targetPositions];

  // return grid.traverse(
  //   spiral({ start: cardWithPossessionPosition, radius: 6 })
  // );
};

// const getMoveTargets = ({
//   gameEntity,
//   cardId,
// }: {
//   gameEntity: StrikersGameEntity;
//   cardId: string;
// }) => {
//   const { gameState } = gameEntity;

//   const cardPosition = gameState.tilePositionsByCardId[cardId];
//   assert(cardPosition, 'expected card to have a position');

//   const validMoveTargets = [];

//   // Create a traverser for the surrounding hexes
//   const moveTraverser = spiral({ start: cardPosition, radius: 1 });

//   // for (const adjacentPosition of grid.traverse(moveTraverser)) {
//   //   // Check if the position is not occupied by a player from the same team
//   //   const occupyingCardId = gameState.tilePositionsByCardId[adjacentPosition];
//   //   if (!occupyingCardId || isOpponent(gameEntity, cardId, occupyingCardId)) {
//   //     validMoveTargets.push({
//   //       position: adjacentPosition,
//   //     });
//   //   }
//   // }

//   return validMoveTargets;
// };

// Constants for pass range
const MIN_PASS_RANGE = 1; // Minimum distance for a valid pass
const MAX_PASS_RANGE = 4; // Maximum distance for a valid pass

// // Replace 'yourHexSettings' with the actual hex settings you use in your game
// const yourHexSettings = {
//   offset: 'odd', // Replace with your hex offset
//   orientation: 'pointy', // Replace with your hex orientation
// };

const SendTargetSelectMessageMetaSchema = z.object({
  action: z.enum(['MOVE', 'PASS']),
});

type SendTargetSelectMessageMeta = z.infer<
  typeof SendTargetSelectMessageMetaSchema
>;

/**
 * Copied from honeycomb, for some reason not able to import?
 * @param a
 * @param b
 */
function equals(a: HexCoordinates, b: HexCoordinates) {
  if (isOffset(a) && isOffset(b)) {
    return a.col === b.col && a.row === b.row;
  }

  // can't use isOffset() because that also checks in the prototype chain and that would always return true for hexes
  if (Object.hasOwn(a, 'col') || Object.hasOwn(b, 'col')) {
    throw new Error(
      `Can't compare coordinates where one are offset coordinates. Either pass two offset coordinates or two axial/cube coordinates. Received: ${JSON.stringify(
        a
      )} and ${JSON.stringify(b)}`
    );
  }

  const cubeA = (isTuple(a) ? tupleToCube(a) : a) as CubeCoordinates;
  const cubeB = (isTuple(b) ? tupleToCube(b) : b) as CubeCoordinates;
  return cubeA.q === cubeB.q && cubeA.r === cubeB.r;
}
