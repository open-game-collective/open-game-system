import { StartGameBlock } from './start-game-block';
import { TurnStartedBlock } from './turn-started-block';

export const strikersMessageBlockMap = {
  StartGame: StartGameBlock,
  TurnStarted: TurnStartedBlock,
} as const;
