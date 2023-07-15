import { entitiesById } from '@api/index';
import {
  Entity,
  StrikersEffectEntity,
  StrikersEffectData,
  WithSenderId,
} from '@explorers-club/schema';
import { assertEntitySchema, assertEventType } from '@explorers-club/utils';
import { StrikersEffectDataSchema } from '@schema/games/strikers';
import { StrikersTurnCommand, StrikersTurnContext } from '@schema/types';
import { World } from 'miniplex';
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

  return createMachine(
    {
      id: 'StrikersTurnMachine',
      schema: {
        context: {} as StrikersTurnContext,
        events: {} as WithSenderId<StrikersTurnCommand>,
      },
      states: {
        InProgress: {
          initial: 'WaitingForInput',
          onDone: 'Complete',
          states: {
            WaitingForInput: {
              on: {
                MOVE: {
                  target: 'Moving',
                },
                PASS: {
                  target: 'Passing',
                },
                SHOOT: {
                  target: 'Shooting',
                },
              },
            },
            Moving: {
              invoke: {
                src: 'runEffect',
                meta: (
                  _: StrikersTurnContext,
                  event: WithSenderId<StrikersTurnCommand>
                ) => {
                  assertEventType(event, 'MOVE');
                  // todo: get playerId from event.senderId
                  // todo perform move, fix from/to

                  return {
                    type: 'MOVE',
                    category: 'ACTION',
                    cardId: event.cardId,
                    fromPosition: event.target,
                    toPosition: event.target,
                  } satisfies StrikersEffectData;
                },
                onDone: 'ActionComplete',
                onError: 'Error',
              },
            },
            Passing: {
              invoke: {
                src: 'runEffect',
                meta: (
                  _: StrikersTurnContext,
                  event: WithSenderId<StrikersTurnCommand>
                ) => {
                  assertEventType(event, 'PASS');
                  // todo fix these values

                  return {
                    type: 'PASS',
                    category: 'ACTION',
                    fromCardId: '',
                    fromPosition: event.target,
                    toCardId: '',
                    toPosition: event.target,
                  } satisfies StrikersEffectData;
                },
                onDone: 'ActionComplete',
                onError: 'Error',
              },
            },
            Shooting: {
              invoke: {
                src: 'runEffect',
                meta: (
                  _: StrikersTurnContext,
                  event: WithSenderId<StrikersTurnCommand>
                ) => {
                  assertEventType(event, 'SHOOT');
                  // todo fix these values

                  return {
                    type: 'SHOOT',
                    category: 'ACTION',
                    fromCardId: '',
                    fromPosition: event.target,
                    toCardId: '',
                    toPosition: event.target,
                  } satisfies StrikersEffectData;
                },
                onDone: 'ActionComplete',
                onError: 'Error',
              },
            },
            ActionComplete: {
              always: [
                {
                  target: 'WaitingForInput',
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
