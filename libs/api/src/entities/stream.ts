import {
  Entity,
  StreamCommand,
  StreamContext,
  WithSenderId,
} from '@explorers-club/schema';
import { assertEntitySchema } from '@explorers-club/utils';
import { World } from 'miniplex';
import { createMachine } from 'xstate';

export const createStreamMachine = ({
  world,
  entity,
}: {
  world: World;
  entity: Entity;
}) => {
  assertEntitySchema(entity, 'stream');

  return createMachine({
    id: 'StreamMachine',
    context: {
      foo: 'bar',
    },
    schema: {
      context: {} as StreamContext,
      events: {} as WithSenderId<StreamCommand>,
    },
    type: 'parallel',
    on: {},
    states: {
      Online: {},
      Error: {},
    },
    predictableActionArguments: true,
  });
};
