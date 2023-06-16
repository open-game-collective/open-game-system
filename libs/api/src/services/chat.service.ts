import { assert } from '@explorers-club/utils';
import {
  ChatCommand,
  ChatContext,
  ChatMachine,
  ConnectionEntity,
  Entity,
  Message,
  MessageChannelEntity,
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
    context: {
      channelEntityIds: {},
    },
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
                // Create a message channel eentity if we don't already have one
                if (!context.channelEntityIds[event.channelId]) {
                  const entity = createEntity<MessageChannelEntity>({
                    schema: 'message_channel',
                    messages: [], // todo prefill previous messages if they exist
                    parentId: event.channelId,
                    connectionId: connectionEntity.id,
                  });
                  world.add(entity);

                  return {
                    ...context.channelEntityIds,
                    [event.channelId]: connectionEntity.id,
                  };
                }

                return context.channelEntityIds;
              },
            }),
          },
          LEAVE_CHANNEL: {
            actions: immerAssign((context, event) => {
              const entity = entitiesById.get(event.channelId);
              assert(
                entity,
                "couldn't find entity that was attempted to be removed"
              );
              world.remove(entity);
              // TODO delete channel entities if no longer in use
              // remove from world
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
