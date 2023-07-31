import { generateSnowflakeId } from '@api/ids';
import { entitiesById } from '@api/index';
import {
  ChannelEvent,
  CreateEventProps,
  StrikersGameEntity,
  StrikersGameEvent,
} from '@explorers-club/schema';
import { assertEntitySchema } from '@explorers-club/utils';
import { LineupCommand, LineupContext } from '@schema/games/strikers';
import { assign } from '@xstate/immer';
import { Subject } from 'rxjs';
import { createMachine } from 'xstate';

export const createLineupMachine = <TMessage extends ChannelEvent>({
  gameChannel,
  gameEntity,
}: {
  gameChannel: Subject<CreateEventProps<StrikersGameEvent>>;
  gameEntity: StrikersGameEntity;
}) => {
  const lineupMachine = createMachine(
    {
      id: 'LineupMachine',
      initial: 'SendMessages',
      schema: {
        events: {} as LineupCommand,
        context: {} as LineupContext,
      },
      context: {
        messageIds: [],
      },
      states: {
        SendMessages: {
          entry: assign((context, event) => {
            const ids: string[] = [];
            gameEntity.config.playerIds.forEach((playerId) => {
              const id = generateSnowflakeId();

              const entity = entitiesById.get(playerId);
              assertEntitySchema(entity, 'strikers_player');

              gameChannel.next({
                id,
                type: 'MESSAGE',
                recipientId: entity.userId,
                contents: [{ type: 'SetLineup' }],
              });
              ids.push(id);
            });
            context.messageIds = ids;
          }),
        },
        WaitingForInput: {
          on: {
            SELECT_FORMATION: {
              actions: () => {
                console.log(event);
              },
            },
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
        sendSetLineupMessages: assign((context, event) => {
          console.log(gameEntity.config);
          for (const playerId in gameEntity.config.playerIds) {
            const id = generateSnowflakeId();

            const entity = entitiesById.get(playerId);
            assertEntitySchema(entity, 'strikers_player');

            gameChannel.next({
              id,
              type: 'MESSAGE',
              recipientId: entity.userId,
              contents: [{ type: 'SetLineup' }],
            });
            console.log('SENT!');
          }
        }),
        // {
        // entry: (context, event) => {
        //   const id = generateSnowflakeId();
        //   gameChannel.next({
        //     id,
        //     type: 'MESSAGE',
        //     contents: [
        //       {
        //         type: 'SetLineup',
        //       },
        //     ],
        //   });
        //   console.log('sending', id);
        // },
        // }
      },
    }
  );
  return lineupMachine;
};
