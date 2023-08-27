import {
  channelObservablesById,
  channelSubjectsById,
  entitiesById,
  generateSnowflakeId,
} from '@api/index';
import {
  Entity,
  GameEntity,
  StrikersEffectEntity,
  WithSenderId,
} from '@explorers-club/schema';
import {
  assert,
  assertEntitySchema,
  assertEventType,
} from '@explorers-club/utils';
import { BlockCommandSchema } from '@schema/common';
import { CardId } from '@schema/game-configuration/strikers';
import {
  StrikersAction,
  StrikersActionSchema,
  StrikersEffectDataSchema,
  StrikersTileCoordinate,
  StrikersTileCoordinateSchema,
} from '@schema/games/strikers';
import {
  BlockCommand,
  StrikersGameEntity,
  StrikersGameEvent,
  StrikersGameEventInput,
  StrikersFieldSide,
  StrikersTurnCommand,
  StrikersGameState,
  StrikersPlayerEntity,
  StrikersTurnContext,
  StrikersTurnEntity,
} from '@schema/types';
import { assign } from '@xstate/immer';
import { compare } from 'fast-json-patch';
import {
  Hex,
  HexCoordinates,
  Orientation,
  distance,
  spiral,
} from 'honeycomb-grid';
import { produce } from 'immer';
import { World } from 'miniplex';
import { Observable, ReplaySubject } from 'rxjs';
import { createMachine } from 'xstate';
import { z } from 'zod';
import * as effects from '../effects';
import { convertStrikersTileCoordinateToRowCol } from '@strikers/lib/utils';
import { axialToStrikersTile } from '@strikers/utils';

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
                                  actions: 'assignSelectedCardId',
                                  cond: (_, event) => event.blockIndex === 1,
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
                                    MULTIPLE_CHOICE_SELECT: {
                                      target: 'Ready',
                                      actions: 'assignSelectedTarget',
                                      cond: (_, event) =>
                                        event.blockIndex === 2,
                                    },
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
                                Error: {},
                                Complete: {
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
                              target: 'Complete',
                            },
                          },
                        },
                        Complete: {
                          initial: 'Submitting',
                          states: {
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
                          },
                          type: 'final',
                        },
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
        assignSelectedCardId: assign((context, event) => {
          assertEventType(event, 'MULTIPLE_CHOICE_SELECT');
          context.selectedCardId = event.value;
        }),

        assignSelectedTarget: assign((context, event) => {
          assertEventType(event, 'MULTIPLE_CHOICE_SELECT');
          const target = StrikersTileCoordinateSchema.parse(event.value);
          context.selectedTarget = target;
        }),

        clearSelections: assign((context) => {
          const messageId =
            context.actionMessageIds[context.actionMessageIds.length - 1];
          const message = messagesById.get(messageId);
          delete context.selectedCardId;

          gameChannelSubject.next({
            id: messageId,
            type: 'MESSAGE',
            contents: [message.contents[0]],
          });
        }),
      },
      services: {
        createMoveEffect: async ({ selectedCardId, selectedTarget }) => {
          assert(selectedCardId, 'expected selectedCardId');
          assert(selectedTarget, 'expected selectedTarget');
          const toPosition =
            convertStrikersTileCoordinateToRowCol(selectedTarget);

          const fromPosition =
            gameEntity.gameState.tilePositionsByCardId[selectedCardId];

          const nextGameState = produce(gameEntity.gameState, (draft) => {
            draft.ballPosition = toPosition;
          });
          const patches = compare(gameEntity.gameState, nextGameState);

          const { createEntity } = await import('@api/ecs');
          const effectEntity = createEntity<StrikersEffectEntity>({
            schema: 'strikers_effect',
            patches,
            parentId: entity.id,
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
            parentId: entity.id,
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
          const toPosition =
            convertStrikersTileCoordinateToRowCol(selectedTarget);

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
            parentId: entity.id,
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
              ? gameEntity.config.homeTeamCardIds[0]
              : gameEntity.config.awayTeamCardIds[0];
          const playerEntity = entitiesById.get(playerId);
          assertEntitySchema(playerEntity, 'strikers_player');

          const id = generateSnowflakeId();

          const availableActions = getAvailableActions({
            gameEntity,
            side,
          });
          const actionCount = getStartedActionCount({ entity });

          const remainingActionCount =
            entity.totalActionCount - actionCount + 1;

          gameChannelSubject.next({
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
          });

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

          const selectedAction = getCurrentSelectedAction(entity);
          const { cardsById } = gameEntity.config;

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

          gameChannelSubject.next({
            id: messageId,
            type: 'MESSAGE',
            contents,
          });
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
              const { q, r } = new Hex(target);
              const tile = axialToStrikersTile({ q, r });
              return {
                name: tile,
                value: tile,
              };
            }),
          } as const;

          const contents = [...message.contents, block];

          gameChannelSubject.next({
            id: messageId,
            type: 'MESSAGE',
            contents,
          });
        },
      },
      guards: {
        // didSelectTarget: (context, event, meta) => {
        //   assertEventType(event, 'MULTIPLE_CHOICE_SELECT');

        //   const currentAction = getCurrentSelectedAction(entity);

        //   return currentAction === 'PASS'
        //     ? event.blockIndex === 1
        //     : event.blockIndex == 2;
        // },
        didSelectPassAction: (context, event, meta) => {
          assertEventType(event, 'MULTIPLE_CHOICE_SELECT');
          const action = getSelectedAction(event);

          return event.blockIndex === 0 && action === 'PASS';
        },
        didSelectMoveAction: (_, event, meta) => {
          assertEventType(event, 'MULTIPLE_CHOICE_SELECT');
          const action = getSelectedAction(event);

          return event.blockIndex === 0 && action === 'MOVE';
        },
        didSelectShootAction: (_, event, meta) => {
          assertEventType(event, 'MULTIPLE_CHOICE_SELECT');
          const action = getSelectedAction(event);

          return event.blockIndex === 0 && action === 'SHOOT';
        },
        hasActionsRemaining: () => {
          const actionCount = getStartedActionCount({ entity });
          return actionCount < entity.totalActionCount;
        },
      },
    }
  );
};

const getStartedActionCount = (props: { entity: StrikersTurnEntity }) => {
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
  // moving and passing are always possible
  const actions: StrikersAction[] = ['MOVE', 'PASS'];

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
  const command = BlockCommandSchema.parse(event);
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
  // todo - to get the actual values
  // traverseral around the grid at the spot where the cardId
  // is then conver talll the surrounding cells to StrikersTileCoordinates
  return [{ row: 0, col: 0 }];
};

const getCardIdWithPossession = (state: StrikersGameState) => {
  if (!state.possession) {
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
    state.tilePositionsByCardId[cardId] === position;
  });
};

const getPassTargets = ({ gameEntity }: { gameEntity: StrikersGameEntity }) => {
  const { gameState } = gameEntity;
  const { possession } = gameState;
  const { sideACardIds: homeSideCardIds, sideBCardIds: awaySideCardIds } =
    gameState;
  const possessionCardId = getCardIdWithPossession(gameEntity.gameState);
  const cardIds =
    possession === 'A'
      ? gameEntity.gameState.sideACardIds
      : gameEntity.gameState.sideBCardIds;

  if (!possessionCardId || !cardIds.includes(possessionCardId)) {
    return [];
  }

  const cardWithPossessionPosition =
    gameEntity.gameState.tilePositionsByCardId[possessionCardId];
  assert(
    cardWithPossessionPosition,
    'expected card with posession to have a position'
  );

  const validPassTargets: HexCoordinates[] = [];

  for (const cardId of cardIds) {
    // Skip the card with possession
    if (cardId === possessionCardId) {
      continue;
    }

    const targetPlayerPosition =
      gameEntity.gameState.tilePositionsByCardId[cardId];

    // Calculate the hex distance between positions
    const hexDist = distance(
      { orientation: Orientation.POINTY, offset: -1 },
      cardWithPossessionPosition,
      targetPlayerPosition
    );

    // Check if the hex distance is within the valid pass range
    if (hexDist >= MIN_PASS_RANGE && hexDist <= MAX_PASS_RANGE) {
      validPassTargets.push(targetPlayerPosition);
    }
  }

  return validPassTargets;
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
