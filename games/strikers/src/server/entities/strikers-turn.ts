import {
  channelObservablesById,
  channelSubjectsById,
  entitiesById,
  generateSnowflakeId,
} from '@api/index';
import { assign } from '@xstate/immer';
import {
  Entity,
  StrikersEffectData,
  StrikersEffectEntity,
  WithSenderId,
} from '@explorers-club/schema';
import {
  assert,
  assertEntitySchema,
  assertEventType,
} from '@explorers-club/utils';
import { StrikersEffectDataSchema } from '@schema/games/strikers';
import {
  StrikersGameEventInput,
  StrikersTurnCommand,
  StrikersTurnContext,
} from '@schema/types';
import { World } from 'miniplex';
import { createMachine } from 'xstate';
import * as effects from '../effects';
import { ReplaySubject } from 'rxjs';

export const createStrikersTurnMachine = ({
  world,
  entity,
}: {
  world: World;
  entity: Entity;
}) => {
  assertEntitySchema(entity, 'strikers_turn');
  const gameChannel = channelSubjectsById.get(entity.gameEntityId) as
    | ReplaySubject<StrikersGameEventInput>
    | undefined;
  assert(gameChannel, 'expected gameChannel but not found');

  const gameEntity = entitiesById.get(entity.gameEntityId);
  assertEntitySchema(gameEntity, 'strikers_game');

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
          initial: 'InProgress',
          states: {
            InProgress: {
              initial: 'SendSelectActionMessage',
              onDone: 'Complete',
              states: {
                SendSelectActionMessage: {
                  invoke: {
                    onDone: {
                      target: 'WaitingForAction',
                      actions: assign((context, event) => {
                        context.actionMessageIds.push(event.data);
                      }),
                    },
                    src: async ({ actionMessageIds }) => {
                      const playerId =
                        entity.side === 'home'
                          ? gameEntity.config.homePlayerIds[0]
                          : gameEntity.config.awayPlayerIds[0];
                      const playerEntity = entitiesById.get(playerId);
                      assertEntitySchema(playerEntity, 'strikers_player');

                      const id = generateSnowflakeId();

                      gameChannel.next({
                        id,
                        type: 'MESSAGE',
                        recipientId: playerEntity.userId,
                        responderId: entity.id,
                        contents: [
                          {
                            type: 'MultipleChoice',
                            text: 'Choose an action',
                            options: [
                              {
                                name: 'Move',
                                value: 'MOVE',
                              },
                              {
                                name: 'Pass',
                                value: 'PASS',
                              },
                              {
                                name: 'Shoot',
                                value: 'SHOOT',
                              },
                            ],
                          },
                        ],
                      });

                      return id;
                    },
                  },
                },
                WaitingForAction: {
                  on: {
                    MULTIPLE_CHOICE_SELECT: [
                      {
                        target: 'Moving',
                        cond: (_, event) => event.value === 'MOVE',
                      },
                      {
                        target: 'Passing',
                        cond: (_, event) => event.value === 'PASS',
                      },
                      {
                        target: 'Shooting',
                        cond: (_, event) => event.value === 'SHOOT',
                      },
                    ],
                  },
                },
                Moving: {
                  initial: 'SendMoveMessage',
                  states: {
                    SendMoveMessage: {
                      invoke: {
                        src: async ({ actionMessageIds }) => {
                          const messageId =
                            actionMessageIds[actionMessageIds.length - 1];

                          gameChannel.next({
                            id: messageId,
                            type: 'MESSAGE',
                            contents: [
                              {
                                type: 'MultipleChoice',
                                text: 'Select a direction',
                                options: [
                                  {
                                    name: 'NorthEast',
                                    value: 'NE',
                                  },
                                  {
                                    name: 'NorthWest',
                                    value: 'NW',
                                  },
                                  {
                                    name: 'SouthEast',
                                    value: 'SE',
                                  },
                                  {
                                    name: 'SouthWest',
                                    value: 'SW',
                                  },
                                  {
                                    name: 'West',
                                    value: 'W',
                                  },
                                  {
                                    name: 'Eeast',
                                    value: 'E',
                                  },
                                ],
                              },
                            ],
                          });
                        },
                        // onDone: 'ActionComplete',
                        // onError: 'Error',
                        // src: 'runEffect',
                        // meta: (
                        //   _: StrikersTurnContext,
                        //   event: WithSenderId<StrikersTurnCommand>
                        // ) => {
                        //   assertEventType(event, 'MOVE');
                        //   // todo: get playerId from event.senderId
                        //   // todo perform move, fix from/to

                        //   return {
                        //     type: 'MOVE',
                        //     category: 'ACTION',
                        //     cardId: event.cardId,
                        //     fromPosition: event.target,
                        //     toPosition: event.target,
                        //   } satisfies StrikersEffectData;
                        // },
                      },
                    },
                  },
                },
                Passing: {
                  // invoke: {
                  //   src: 'runEffect',
                  //   meta: (
                  //     _: StrikersTurnContext,
                  //     event: WithSenderId<StrikersTurnCommand>
                  //   ) => {
                  //     assertEventType(event, 'PASS');
                  //     // todo fix these values
                  //     return {
                  //       type: 'PASS',
                  //       category: 'ACTION',
                  //       fromCardId: '',
                  //       fromPosition: event.target,
                  //       toCardId: '',
                  //       toPosition: event.target,
                  //     } satisfies StrikersEffectData;
                  //   },
                  //   onDone: 'ActionComplete',
                  //   onError: 'Error',
                  // },
                },
                Shooting: {
                  // invoke: {
                  //   src: 'runEffect',
                  //   meta: (
                  //     _: StrikersTurnContext,
                  //     event: WithSenderId<StrikersTurnCommand>
                  //   ) => {
                  //     assertEventType(event, 'SHOOT');
                  //     // todo fix these values
                  //     return {
                  //       type: 'SHOOT',
                  //       category: 'ACTION',
                  //       fromCardId: '',
                  //       fromPosition: event.target,
                  //       toCardId: '',
                  //       toPosition: event.target,
                  //     } satisfies StrikersEffectData;
                  //   },
                  //   onDone: 'ActionComplete',
                  //   onError: 'Error',
                  // },
                },
                ActionComplete: {
                  always: [
                    {
                      target: 'WaitingForAction',
                      cond: 'hasActionsRemaining',
                    },
                    {
                      target: 'NoMoreActions',
                    },
                  ],
                },
                NoMoreActions: {
                  type: 'final',
                },
                Error: {
                  entry: console.error,
                },
              },
            },
            Complete: {
              type: 'final',
            },
          },
        },
      },
      predictableActionArguments: true,
    },
    {
      services: {
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

        // runGameEffect: async (context, event, invokeMeta) => {
        //   const effectProps = StrikersTurnEffectPropsSchema.parse(
        //     invokeMeta.data
        //   );

        //   const effect = {
        //     id: randomUUID(),
        //     patches: [],
        //     state: 'in_progress',
        //     parentId: undefined,
        //     children: [],
        //     ...effectProps,
        //   } as StrikersTurnEffect;

        //   const spawn = (childEffectProps: StrikersTurnEffectProps) => {
        //     const childEffect = {
        //       id: randomUUID(),
        //       patches: [],
        //       state: 'in_progress',
        //       parentId: effect.id,
        //       children: [],
        //       ...childEffectProps,
        //     } as StrikersTurnEffect;
        //     effect.children.push(childEffect.id);
        //     const childMachine =
        //       effectMachineMap[effectProps.type](childEffect);
        //     const childActor = interpret(childMachine);
        //     childActor.start();

        //     // childEffectProps.type === "MOVE"
        //     // childEffectProps.category === ""
        //   };

        //   const machine = effectMachineMap[effectProps.type](effect);
        //   const actor = interpret(machine);
        //   actor.start();

        //   return new Promise((resolve) => {
        //     effect.state = 'resolved';
        //     actor.onDone(resolve);
        //   });
        // },
      },
      guards: {
        hasActionsRemaining: () => {
          const entities = entity.effects
            .map(entitiesById.get)
            .filter((entity) => {
              assertEntitySchema(entity, 'strikers_effect');
              return (
                entity.category === 'ACTION' &&
                entity.states.Status === 'Resolved'
              );
            });
          return entities.length < entity.totalActionCount;
        },
      },
    }
  );
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

// const createEffect = (effectProps: Omit<StrikersTurnEffect, 'id'>) => {
//   return

// }

// const createEffectMachine = (effect: StrikersTurnEffectProps) => {
//   switch (effect.type) {
//     case 'MOVE':
//       return createMachine({
//         id: 'MoveActionEffectMachine',
//         initial: 'Initializing',
//         states: {
//           Initializing: {
//             always: [
//               {
//                 cond: 'moveTrigger',
//               },
//             ],
//           },
//           TackleAttempt: {},
//         },
//       });
//   }

//   return createMachine({});
// };
