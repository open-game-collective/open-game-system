/*
 * Think of channels as the place where events and changes from an entity
 * get streamed "to". It has access to an individual's user id it is able
 * to determine which events it should filter out for the user and which to
 * include.
 *
 * Channels only run on the server where the client doesn't have access.
 *
 * This is an example of an entity type with a dynmaic service type.
 * Services are pretty close to systems in ECS.
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

// return createMachine({
//   id: 'MessageChannelMachine',
//   type: 'parallel',
//   schema: {
//     context: {} as MessageChannelContext,
//     events: {} as MessageChannelCommand,
//   },
//   states: {},
//   predictableActionArguments: true,
// });

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
                  // // If a new message jsut add it ot the list
                  if (event.type === 'MESSAGE') {
                    const messageId = event.id;

                    if (
                      event.recipientId &&
                      event.recipientId !== userEntity.id
                    ) {
                      // Don't add messages if a recipient is specified
                      // and it doesn't match this user
                      return;
                    }

                    // first check if this message id already there
                    // todo make not o(n) somehow
                    const existingMessage = messageChannelEntity.messages.find(
                      (message) => message.id === messageId
                    );

                    if (!existingMessage) {
                      messageChannelEntity.messages = [
                        ...messageChannelEntity.messages,
                        event,
                      ];
                    } else {
                      // if its an existing message, remove the old one from the list
                      // and put new one at the end
                      const messages = messageChannelEntity.messages.filter(
                        (message) => {
                          return message.id !== existingMessage.id;
                        }
                      );
                      messageChannelEntity.messages = [...messages, event];
                    }
                  }
                });

                // Keep the machine invoked/listening
                const parentChannel = channelObservablesById.get(channelEntity.id);
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

  // parentEntity.channel.pipe(map((f) => f)).subscribe((e) => {

  // })
  // parentEntity.channel.subscribe((e) => {

  // })

  // parentEntity.channel.subscribe((e) => {
  //   console.log(e);
  // })

  // parentEntity.channel.subscribe((messageData) => {

  // })

  // parentEntity.subscribe((event) => {
  //   event.type
  // })

  // switch (parentEntity.schema) {
  //   case 'room':
  //     // parentEntity.channel.subscribe((e) => {
  //     //   console.log(e);
  //     // });
  //     // What does this channel do?
  //     return createMachine({}) as MessageChannelMachine;
  //   case 'little_vigilante_game':
  //     return createMachine({}) as MessageChannelMachine;
  //   case 'codebreakers_game':
  //     return createMachine({}) as MessageChannelMachine;
  //   case 'banana_traders_game':
  //     return createMachine({}) as MessageChannelMachine;
  //   default:
  //     throw new Error(
  //       'message channel machine not implemented for entity schema: ' +
  //         parentEntity.schema
  //     );
  // }
};
