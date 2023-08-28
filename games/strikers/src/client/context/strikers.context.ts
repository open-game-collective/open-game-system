import { StrikersGameEntity, StrikersPlayerEntity } from '@schema/types';
import { createContext } from 'react';

export const StrikersContext = createContext({
  gameEntity: {} as StrikersGameEntity,
  playerEntity: {} as StrikersPlayerEntity | null,
});
