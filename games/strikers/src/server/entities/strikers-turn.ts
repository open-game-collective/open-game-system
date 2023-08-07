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
import { assert, assertEntitySchema } from '@explorers-club/utils';
import {
  StrikersAction,
  StrikersActionSchema,
  StrikersEffectDataSchema,
} from '@schema/games/strikers';
import {
  // PointyDirection,
  // StrikersCard,
  StrikersGameEntity,
  StrikersGameEvent,
  StrikersGameEventInput,
  StrikersPlayerEntity,
  StrikersTurnCommand,
  StrikersTurnContext,
  StrikersTurnEntity,
} from '@schema/types';
import { assign } from '@xstate/immer';
import { World } from 'miniplex';
import { Observable, ReplaySubject } from 'rxjs';
import { createMachine } from 'xstate';
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
                            actions: 'assignMoveAction',
                            cond: 'didSelectMoveAction',
                          },
                          {
                            target: 'Shooting',
                            actions: 'assignShootAction',
                            cond: 'didSelectShootAction',
                          },
                          {
                            target: 'Passing',
                            actions: 'assignPassAction',
                            cond: 'didSelectPassAction',
                          },
                        ],
                      },
                    },
                    Moving: {
                      initial: 'SendPlayerSelectMessage',
                      on: {
                        MULTIPLE_CHOICE_SELECT: [
                          {
                            target: 'Shooting',
                            actions: 'assignShootAction',
                            cond: 'didSelectShootAction',
                          },
                          {
                            target: 'Passing',
                            actions: 'assignPassAction',
                            cond: 'didSelectPassAction',
                          },
                        ],
                      },
                      states: {
                        SendPlayerSelectMessage: {
                          invoke: {
                            src: async () => {},
                          },
                          onDone: 'InputtingPlayer',
                        },
                        InputtingPlayer: {
                          initial: 'Unselected',
                          onDone: 'Complete',
                          states: {
                            Unselected: {
                              on: {
                                MULTIPLE_CHOICE_SELECT: {
                                  target: 'PlayerSelected',
                                  actions: 'assignSelectedPlayer',
                                  cond: 'didSelectPlayer',
                                },
                              },
                            },
                            PlayerSelected: {
                              initial: 'SendTargetSelectMessage',
                              states: {
                                SendTargetSelectMessage: {
                                  invoke: {
                                    src: async () => {},
                                  },
                                  onDone: 'InputtingTarget',
                                },
                                InputtingTarget: {
                                  on: {
                                    MULTIPLE_CHOICE_SELECT: {
                                      target: 'Ready',
                                      actions: 'assignTarget',
                                      cond: 'didSelectTarget',
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
                      on: {
                        MULTIPLE_CHOICE_SELECT: [
                          {
                            target: 'Moving',
                            actions: 'assignMoveAction',
                            cond: 'didSelectMoveAction',
                          },
                          {
                            target: 'Shooting',
                            actions: 'assignShootAction',
                            cond: 'didSelectShootAction',
                          },
                        ],
                      },
                    },
                    Shooting: {
                      on: {
                        MULTIPLE_CHOICE_SELECT: [
                          {
                            target: 'Moving',
                            actions: 'assignMoveAction',
                            cond: 'didSelectMoveAction',
                          },
                          {
                            target: 'Passing',
                            actions: 'assignPassAction',
                            cond: 'didSelectPassAction',
                          },
                        ],
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
        assignPassAction: assign((context, event) => {
          context.selectedAction = 'PASS';
        }),
        assignMoveAction: assign((context, event) => {
          context.selectedAction = 'MOVE';
        }),
        assignShootAction: assign((context, event) => {
          context.selectedAction = 'SHOOT';
        }),
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
        didSelectPassAction: () => {
          // todo
          return true;
        },
        didSelectMoveAction: () => {
          // todo
          return true;
        },
        didSelectShootAction: () => {
          // todo
          return true;
        },
        hasActionsRemaining: () => {
          const actionCount = getStartedActionCount({ entity });
          return actionCount < entity.totalActionCount;
        },
      },
    }
  );
};
//       Moving: {
//         initial: 'SendMoveMessage',
//         states: {
//           SendMoveMessage: {
//             invoke: {
//               src: async ({ actionMessageIds }) => {
//                 const messageId =
//                   actionMessageIds[actionMessageIds.length - 1];

//                 const message = messagesById.get(messageId);

//                 const contents = [
//                   ...message.contents,
//                   {
//                     type: 'MultipleChoice',
//                     text: 'Select a direction',
//                     options: [
//                       {
//                         name: 'NorthEast',
//                         value: 'NE',
//                       },
//                       {
//                         name: 'NorthWest',
//                         value: 'NW',
//                       },
//                       {
//                         name: 'SouthEast',
//                         value: 'SE',
//                       },
//                       {
//                         name: 'SouthWest',
//                         value: 'SW',
//                       },
//                       {
//                         name: 'West',
//                         value: 'W',
//                       },
//                       {
//                         name: 'Eeast',
//                         value: 'E',
//                       },
//                     ],
//                   },
//                 ];

//                 gameChannelSubject.next({
//                   id: messageId,
//                   type: 'MESSAGE',
//                   contents,
//                 });
//               },
//             },
//           },
//         },
//       },
//       Passing: {
//         // invoke: {
//         //   src: 'runEffect',
//         //   meta: (
//         //     _: StrikersTurnContext,
//         //     event: WithSenderId<StrikersTurnCommand>
//         //   ) => {
//         //     assertEventType(event, 'PASS');
//         //     // todo fix these values
//         //     return {
//         //       type: 'PASS',
//         //       category: 'ACTION',
//         //       fromCardId: '',
//         //       fromPosition: event.target,
//         //       toCardId: '',
//         //       toPosition: event.target,
//         //     } satisfies StrikersEffectData;
//         //   },
//         //   onDone: 'ActionComplete',
//         //   onError: 'Error',
//         // },
//       },
//       Shooting: {
//         // invoke: {
//         //   src: 'runEffect',
//         //   meta: (
//         //     _: StrikersTurnContext,
//         //     event: WithSenderId<StrikersTurnCommand>
//         //   ) => {
//         //     assertEventType(event, 'SHOOT');
//         //     // todo fix these values
//         //     return {
//         //       type: 'SHOOT',
//         //       category: 'ACTION',
//         //       fromCardId: '',
//         //       fromPosition: event.target,
//         //       toCardId: '',
//         //       toPosition: event.target,
//         //     } satisfies StrikersEffectData;
//         //   },
//         //   onDone: 'ActionComplete',
//         //   onError: 'Error',
//         // },
//       },
//       ActionComplete: {
//         always: [
//           {
//             target: 'InputtingAction',
//             cond: 'hasActionsRemaining',
//           },
//           {
//             target: 'NoMoreActions',
//           },
//         ],
//       },
//       NoMoreActions: {
//         type: 'final',
//       },
//       Error: {
//         entry: console.error,
//       },
//     },
//   },
//   Complete: {
//     type: 'final',
//   },
// },

const getStartedActionCount = (props: { entity: StrikersTurnEntity }) => {
  const entities = props.entity.effects
    .map(entitiesById.get)
    .filter((entity) => {
      assertEntitySchema(entity, 'strikers_effect');
      return (
        entity.category === 'ACTION' && entity.states.Status === 'Resolved'
      );
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
