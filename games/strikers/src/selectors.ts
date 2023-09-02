import { StrikersGameEntity } from '@schema/types';
import { createSelector } from 'reselect';
import { matchesState } from 'xstate';
import { matchesLineupState } from './matchers';

// export const selectGameStates = (entity: StrikersGameEntity) => entity.states;

export const selectCurrentScene = (entity: StrikersGameEntity) => {
  if (matchesLineupState(entity.states)) {
    return 'lineup';
  }

  return 'turn';
};

// export const selectCurrentScene = createSelector(selectGameStates, (states) => {
//   if (matchesLineupState(states)) {
//     return 'lineup';
//   }

//   return 'game';
// });
