import { StrikersEffectEntity } from '@schema/types';
import { MoveEffect } from './move-effect';

export default {
  component: MoveEffect,
};

export const Default = {
  render: () => {
    return (
      <MoveEffect
        entity={
          {
            id: 'foo',
            schema: 'strikers_effect',
            patches: [],
            turnId: 'foo-turn',
            gameId: 'foo-game',
            category: 'ACTION',
            data: {
              type: 'MOVE',
              cardId: 'foo-card',
              fromPosition: { row: 13, col: 13 },
              toPosition: { row: 12, col: 13 },
            },
          } as unknown as StrikersEffectEntity
        }
      />
    );
  },
};

export const WithTriggeredTackle = {
  render: () => {
    return (
      <MoveEffect
        entity={
          {
            id: 'foo',
            schema: 'strikers_effect',
            patches: [],
            turnId: 'foo-turn',
            gameId: 'foo-game',
            category: 'ACTION',
            data: {
              type: 'MOVE',
              cardId: 'foo-card',
              fromPosition: { row: 13, col: 13 },
              toPosition: { row: 12, col: 13 },
            },
          } as unknown as StrikersEffectEntity
        }
      />
    );
  },
};