import type {
  BlockCommand,
  ChannelEntity,
  Entity,
  MessageContentBlock,
  MessageEvent,
} from '@schema/types';
import { createContext } from 'react';

export const BlockContext = createContext(
  {} as {
    block: MessageContentBlock;
    blockIndex: number;
    message: MessageEvent;
    channelEntity: ChannelEntity;
    respond: (input: BlockCommand) => void;
  }
);
