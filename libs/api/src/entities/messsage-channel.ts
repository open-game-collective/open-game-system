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
