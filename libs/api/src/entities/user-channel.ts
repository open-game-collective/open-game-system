import {
  Entity,
  UserChannelCommand,
  UserChannelContext,
} from '@explorers-club/schema';
import { World } from 'miniplex';
import { createMachine } from 'xstate';

export const createUserChannelMachine = ({
  world,
}: {
  world: World;
  entity: Entity;
}) => {
  return createMachine({
    id: 'UserChannelMachine',
    type: 'parallel',
    schema: {
      context: {} as UserChannelContext,
      events: {} as UserChannelCommand,
    },
    states: {},
  });
};
