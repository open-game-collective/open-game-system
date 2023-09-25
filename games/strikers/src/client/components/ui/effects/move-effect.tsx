import { StrikersEffectEntity } from '@explorers-club/schema';
import { assert } from '@explorers-club/utils';
import {
  alphaNumToOffsetCoordiantes,
  hexCoordinatesToAlphaNum,
} from '@strikers/lib/utils';
import { FC } from 'react';

export const MoveEffect: FC<{ entity: StrikersEffectEntity }> = ({
  entity,
}) => {
  assert(entity.data.type === 'MOVE', 'expected effect to be of type MOVE');
  const from = hexCoordinatesToAlphaNum(entity.data.fromPosition);
  const to = hexCoordinatesToAlphaNum(entity.data.toPosition);
  return (
    <>
      Move Effect from {from} to {to}
    </>
  );
};
