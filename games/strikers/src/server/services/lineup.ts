import { generateSnowflakeId } from '@api/ids';
import { entitiesById } from '@api/index';
import {
  ChannelEvent,
  CreateEventProps,
  SnowflakeId,
  StrikersGameEntity,
  StrikersGameEvent,
  StrikersGameEventInput,
  UpdateEventProps,
  WithSenderId,
} from '@explorers-club/schema';
import { assertEntitySchema } from '@explorers-club/utils';
import {
  FormationLiteral,
  LineupCommand,
  LineupContext,
} from '@schema/games/strikers';
import { assign } from '@xstate/immer';
import { Subject } from 'rxjs';
import { createMachine } from 'xstate';
import { z } from 'zod';
import { getSenderEntities } from '@api/server/utils';

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
      initial: 'SendMessages',
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
          console.log('MARKIN PLAYER FINISHED!', event);
          const { userEntity } = getSenderEntities(event.senderId);
          const strikersPlayer = getStrikersPlayer(userEntity.id, gameEntity);

          context.finishedPlayerIds.push(strikersPlayer.id);
          const messageId = context.messageIdsByPlayerId[strikersPlayer.id];
          const formation = context.formationsByPlayerId[strikersPlayer.id];

          gameChannel.next({
            id: messageId,
            type: "MESSAGE",
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
