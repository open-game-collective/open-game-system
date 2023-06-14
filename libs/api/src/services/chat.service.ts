import {
  ChatCommand,
  ChatContext,
  ChatMachine,
  ConnectionEntity,
  Entity,
  Message,
  UserChannelEntity,
} from '@explorers-club/schema';
import { Observable, Subject } from 'rxjs';
import { assign, createMachine } from 'xstate';
import { assign as immerAssign } from '@xstate/immer';
import { createEntity } from '../ecs';
import { entitiesById, world } from '../server/state';

export const createChatMachine = <TMessage extends Message>({
  connectionEntity,
}: {
  connectionEntity: ConnectionEntity;
}) => {
  const chatMachine = createMachine({
    id: 'ChatMachine',
    initial: 'Running',
    schema: {
      events: {} as ChatCommand,
      context: {} as ChatContext,
    },
    states: {
      Running: {
        on: {
          JOIN_CHANNEL: {
            actions: assign({
              channelEntityIds: (context, event) => {
                const entity = createEntity<UserChannelEntity>({
                  schema: 'user_channel',
                  messages: [],
                  connectionId: connectionEntity.id,
                });
                world.add(entity);

                return {
                  ...context.channelEntityIds,
                  [event.channelId]: connectionEntity.id,
                };
              },
            }),
          },
          LEAVE_CHANNEL: {
            actions: immerAssign((context, event) => {
              // TODO delete channel entities if no longer in use
              delete context.channelEntityIds[event.channelId];
            }),
          },
        },
      },
      Error: {},
      Done: {
        type: 'final',
      },
    },
  }) satisfies ChatMachine;
  return chatMachine;
};

const fromEntity = <TEntity extends Entity>(entity: TEntity) => {
  type TCallback = Parameters<TEntity['subscribe']>[0];
  type TEvent = Parameters<TCallback>[0];

  const event$ = new Subject<TEvent>();
  const sub = entity.subscribe((e) => {
    event$.next(e);

    // todo unsub when done
  });

  return event$ as Observable<TEvent>;
};
