import { StrikersGameStateValue } from '@schema/types';

export const matchesLineupState = (state: StrikersGameStateValue) => {
  return typeof state.PlayStatus === 'string' && state.PlayStatus === 'Lineup';
};
