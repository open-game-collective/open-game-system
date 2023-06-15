/*
 * Think of channels as the place where events and changes from an entity
 * get streamed "to". It has access to an individual's user id it is able
 * to determine which events it should filter out for the user and which to
 * include.
 * 
 * Channels only run on the server where the client doesn't have access.
*/ 
import {
  Entity,
  MessageChannelCommand,
  MessageChannelContext,
} from '@explorers-club/schema';
import { World } from 'miniplex';
import { createMachine } from 'xstate';

export const createMessageChannelMachine = ({
  world,
}: {
  world: World;
  entity: Entity;
}) => {
  return createMachine({
    id: 'MessageChannelMachine',
    type: 'parallel',
    schema: {
      context: {} as MessageChannelContext,
      events: {} as MessageChannelCommand,
    },
    states: {},
  });
};
