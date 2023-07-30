import {
  Entity,
  StrikersPlayerCommand,
  StrikersPlayerContext,
  StrikersPlayerMachine,
  WithSenderId,
} from '@explorers-club/schema';
import { assertEntitySchema } from '@explorers-club/utils';
import { World } from 'miniplex';
import { createMachine } from 'xstate';

export const createStrikersPlayerMachine = ({
  world,
  entity,
}: {
  world: World;
  entity: Entity;
}) => {
  assertEntitySchema(entity, 'strikers_player');

  return createMachine({
    id: 'StrikersPlayerMachine',
    type: 'parallel',
    schema: {
      context: {} as StrikersPlayerContext,
      events: {} as WithSenderId<StrikersPlayerCommand>,
    },
    states: {
      Active: {
        initial: 'False',
        states: {
          False: {},
          True: {},
        },
        on: {
          CHANGE_CAMERA_POSITION: {
            actions: async (_, event) => {
              switch (event.cameraPosition) {
                case 'BirdsEye':
                  entity.cameraPosition = {
                    x: 0,
                    y: entity.cameraPosition.y - 10,
                    z: 0,
                    targetX: 0,
                    targetY: 0,
                    targetZ: 0,
                  };
                  break;
              }
            },
          },
        },
      },
    },
  }) satisfies StrikersPlayerMachine;
};
