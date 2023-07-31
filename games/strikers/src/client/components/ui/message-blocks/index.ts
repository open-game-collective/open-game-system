import { StartGameBlock } from '@strikers/client/components/ui/message-blocks/start-game-block';
import { TurnStartedBlock } from './turn-started-block';

export const strikersMessageBlockMap = {
  StartGame: StartGameBlock,
  TurnStarted: TurnStartedBlock,
} as const;
