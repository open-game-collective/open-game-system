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
import { BlockCommandSchema } from '@schema/common';
import { CardId } from '@schema/game-configuration/strikers';
import {
  StrikersAction,
  StrikersActionSchema,
  StrikersEffectDataSchema,
  StrikersSide,
  StrikersTileCoordinate,
  StrikersTileCoordinateSchema,
} from '@schema/games/strikers';
import {
  BlockCommand,
  StrikersGameEntity,
  StrikersGameEvent,
  StrikersGameEventInput,
  StrikersGameState,
  StrikersPlayerEntity,
  StrikersTurnCommand,
  StrikersTurnContext,
  StrikersTurnEntity,
} from '@schema/types';
import { assign } from '@xstate/immer';
import { compare } from 'fast-json-patch';
import { HexCoordinates } from 'honeycomb-grid';
import { produce } from 'immer';
import { World } from 'miniplex';
import { Observable, ReplaySubject } from 'rxjs';
import { createMachine } from 'xstate';
import { z } from 'zod';
import * as effects from '../effects';

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
                                      target: 'Complete',
                                    },
                                  },
                                },
                                Complete: {
                                  entry: 'createMoveEffect',
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
                          entry: 'createPassEffect',
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
                          entry: 'createShotEffect',
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
          entity.effects.push(effectEntity.id);
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
          const toCardId = getCardIdAtPosessionOnTeam(
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
          entity.effects.push(effectEntity.id);
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
          entity.effects.push(effectEntity.id);
          gameEntity.gameState = nextGameState;

          return entity;
        },
      },
      services: {
        sendSelectActionMessage: async () => {
          const playerId =
            entity.side === 'home'
              ? gameEntity.config.homePlayerIds[0]
              : gameEntity.config.awayPlayerIds[0];
          const playerEntity = entitiesById.get(playerId);
          assertEntitySchema(playerEntity, 'strikers_player');

          const id = generateSnowflakeId();

          const availableActions = getAvailableActions({
            gameEntity,
            playerEntity,
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
            entity.side === 'home'
              ? gameEntity.gameState.homeSideCardIds
              : gameEntity.gameState.awaySideCardIds;
          // entity.states.Status

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
          let targets: StrikersTileCoordinate[];

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
            options: targets.map((target) => ({
              name: target,
              value: target,
            })),
          } as const;

          const contents = [...message.contents, block];

          gameChannelSubject.next({
            id: messageId,
            type: 'MESSAGE',
            contents,
          });
        },
        runEffect: async (
          context: StrikersTurnContext,
          event: WithSenderId<StrikersTurnCommand>,
          invokeMeta
        ) => {
          const data = StrikersEffectDataSchema.parse(invokeMeta.data);
          const { createEntity } = await import('@api/ecs');
          const effectEntity = createEntity<StrikersEffectEntity>({
            schema: 'strikers_effect',
            patches: [],
            parentId: undefined,
            category: 'ACTION',
            data,
          });

          entity.effects.push(effectEntity.id);

          await new Promise((resolve) => {
            entity.subscribe((e) => {
              if (effectEntity.states.Status === 'Resolved') {
                resolve(null);
              }
            });
          });

          return entity;
        },
      },
      guards: {
        didSelectTarget: (context, event, meta) => {
          assertEventType(event, 'MULTIPLE_CHOICE_SELECT');

          const currentAction = getCurrentSelectedAction(entity);

          return currentAction === 'PASS'
            ? event.blockIndex === 1
            : event.blockIndex == 2;
        },
        didSelectPassAction: (context, event, meta) => {
          console.log({ meta });
          assertEventType(event, 'MULTIPLE_CHOICE_SELECT');
          const action = getSelectedAction(event);

          return event.blockIndex === 0 && action === 'PASS';
        },
        didSelectMoveAction: (_, event, meta) => {
          console.log({ meta });
          assertEventType(event, 'MULTIPLE_CHOICE_SELECT');
          const action = getSelectedAction(event);

          return event.blockIndex === 0 && action === 'MOVE';
        },
        didSelectShootAction: (_, event, meta) => {
          console.log({ meta });
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
  const entities = props.entity.effects
    .map(entitiesById.get)
    .filter((entity) => {
      assertEntitySchema(entity, 'strikers_effect');
      return entity.category === 'ACTION' && entity.states.Status;
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
const getAvailableActions = (props: {
  gameEntity: StrikersGameEntity;
  playerEntity: StrikersPlayerEntity;
}) => {
  // todo: imlementation
  return ['MOVE', 'PASS', 'SHOOT'] as StrikersAction[];
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

/**
 * Given the current game instance and the current players
 * turn, return a list of tile positions that the player
 * is allowed to pass to
 */
// const getPassTargets = (props: {
//   gameEntity: StrikersGameEntity;
//   playerEntity: StrikersPlayerEntity;
// }) => {
//   // todo: imlementation
//   return ['MOVE', 'PASS', 'SHOOT'] as StrikersAction[];
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

const getCurrentSelectedActionState = (entity: StrikersTurnEntity) => {
  if (typeof entity.states.Status === 'object') {
    if (typeof entity.states.Status.Actions === 'object') {
      if (typeof entity.states.Status.Actions.InputtingAction === 'object') {
        return entity.states.Status.Actions.InputtingAction;
      }
    }
  }
  return undefined;
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
}) => StrikersTileCoordinate[] = (props) => {
  // todo - to get the actual values
  // traverseral around the grid at the spot where the cardId
  // is then conver talll the surrounding cells to StrikersTileCoordinates
  return ['G2', 'G3', 'F4', 'F3', 'H5'];
};

// const getCardIdsByTile = (
//   state: StrikersGameState,
//   coordinate: HexCoordinates
// ) => {
//   return Object.entries(state.tilePositionsByCardId)
//     .filter(
//       // does this equality work?
//       ([cardId, position]) => position === coordinate
//     )
//     .map(([cardId]) => cardId);
// };

const getCardIdWithPossession = (state: StrikersGameState) => {
  return getCardIdAtPosessionOnTeam(
    state,
    state.ballPosition,
    state.possession
  );
};

const getCardIdAtPosessionOnTeam = (
  state: StrikersGameState,
  position: HexCoordinates,
  side: StrikersSide
) => {
  const cardIds =
    side === 'home' ? state.homeSideCardIds : state.awaySideCardIds;
  return cardIds.find((cardId) => {
    state.tilePositionsByCardId[cardId] === position;
  });
};

const getPassTargets: (props: {
  gameEntity: StrikersGameEntity;
}) => StrikersTileCoordinate[] = (props) => {
  // todo - to get the actual values
  // traverseral around the grid at the spot where the cardId
  // is then conver talll the surrounding cells to StrikersTileCoordinates
  return ['A2', 'B2', 'B4', 'C3', 'C5'];
};

const SendTargetSelectMessageMetaSchema = z.object({
  action: z.enum(['MOVE', 'PASS']),
});

type SendTargetSelectMessageMeta = z.infer<
  typeof SendTargetSelectMessageMetaSchema
>;

function convertStrikersTileCoordinateToRowCol(
  coordinate: StrikersTileCoordinate
) {
  // As per the zod schema, we know at this point that the format is correct.

  // Extract the letter and number parts
  const letter = coordinate[0];
  const number = parseInt(coordinate.substring(1));

  // Convert the letter to a row number (0-based)
  const row = letter.charCodeAt(0) - 'A'.charCodeAt(0);

  // Adjust the number to be 0-based column
  const col = number - 1;

  return { row, col };
}
