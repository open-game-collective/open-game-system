import { StrikersTurnEntity } from '@schema/types';
import { createContext } from 'react';

export const TurnContext = createContext({
  turnEntity: {} as StrikersTurnEntity,
});
