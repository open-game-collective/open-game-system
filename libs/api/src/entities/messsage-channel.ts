/*
 * Think of channels as the place where events and changes from an entity
 * get streamed to. It has access to an individual's user id so it is able
 * to determine which events it should filter out for the user and which to
 * include.
 *
 * Channels only run on the server where the client doesn't have access.
 */
import {
  Entity,
  MessageChannelCommand,
  MessageChannelContext,
  MessageChannelEntity,
  MessageChannelMachine,
} from '@explorers-club/schema';
import { assert, assertEntitySchema } from '@explorers-club/utils';
import { World } from 'miniplex';
import { createMachine } from 'xstate';
import { channelObservablesById, entitiesById } from '../server/state';

export const createMessageChannelMachine = ({
  world,
  entity,
}: {
  world: World;
  entity: Entity;
}) => {
  const messageChannelEntity = entity as MessageChannelEntity;
  const channelEntity = entitiesById.get(messageChannelEntity.channelId);
  assert(channelEntity, "expected channelEntity but wasn't found");
  const channel = channelObservablesById.get(channelEntity.id);
  assert(channel, 'expected channel but was undefined');

  const userEntity = entitiesById.get(messageChannelEntity.userId);
  assertEntitySchema(userEntity, 'user');

  // sessionEntity.userId
  // sessionEntity.

  return createMachine({
    id: 'MessageChannelMachine',
    initial: 'Initialized',
    context: {
      foo: '',
    },
    schema: {
      events: {} as MessageChannelCommand,
      context: {} as MessageChannelContext,
    },
    states: {
      Initialized: {
        initial: 'Running',
        states: {
          Running: {
            invoke: {
              src: async () => {
                channel.subscribe((event) => {
                  if (
                    event.recipientId &&
                    event.recipientId !== userEntity.id
                  ) {
                    // Don't add messages if a recipient is specified
                    // and it doesn't match this user
                    return;
                  }

                  if (event.type === 'MESSAGE') {
                    const eventId = event.id;

                    // first check if this event id already there
                    // todo make not o(n) somehow
                    const existingMessageId =
                      messageChannelEntity.messageIds.find(
                        (messageId) => messageId === eventId
                      );

                    if (!existingMessageId) {
                      messageChannelEntity.messageIds = [
                        ...messageChannelEntity.messageIds,
                        eventId,
                      ];

                      // todo trigger the push notification send here
                      // if appropriate
                    } else {
                      // if its an existing message, remove the old one from the list
                      // and put new one at the end
                      const messageIds = messageChannelEntity.messageIds.filter(
                        (messageId) => {
                          return messageId !== existingMessageId;
                        }
                      );
                      messageChannelEntity.messageIds = [
                        ...messageIds,
                        existingMessageId,
                      ];
                    }
                  }

                  // store all events directly by id
                  // todo: some duplication here w/ messages, might be better model
                  // maybe messages jsut needs to sotre ids
                  messageChannelEntity.eventsById = {
                    ...messageChannelEntity.eventsById,
                    [event.id]: event,
                  };
                });

                // Keep the machine invoked/listening
                const parentChannel = channelObservablesById.get(
                  channelEntity.id
                );
                assert(
                  parentChannel,
                  'expect parentChannel when subscribing to chanel'
                );
                await parentChannel.toPromise();
              },
              onError: 'Error',
            },
          },
          Error: {
            entry: console.error,
          },
        },
      },
    },
  }) satisfies MessageChannelMachine;
};
