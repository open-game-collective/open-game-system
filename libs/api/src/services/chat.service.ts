import {
  ChannelEvent,
  ChatCommand,
  ChatContext,
  ChatMachine,
  MessageChannelEntity,
  UserEntity,
} from '@explorers-club/schema';
import { assert } from '@explorers-club/utils';
import { assign as immerAssign } from '@xstate/immer';
import { assign, createMachine } from 'xstate';
import { createEntity } from '../ecs';
import { entitiesById, world } from '../server/state';
import { channelObservablesById } from '../server/state';

export const createChatMachine = <TMessage extends ChannelEvent>({
  userEntity,
}: {
  userEntity: UserEntity;
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
          ENTER_CHANNEL: {
            actions: assign({
              channelEntityIds: (context, event) => {
                // Create a message channel eentity if we don't already have one
                if (!context.channelEntityIds[event.channelId]) {
                  const entity = createEntity<MessageChannelEntity>({
                    schema: 'message_channel',
                    events: [],
                    channelId: event.channelId,
                    userId: userEntity.id,
                  });

                  world.add(entity);
                  const entityId = entity.id;

                  return {
                    ...context.channelEntityIds,
                    [event.channelId]: entityId,
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
