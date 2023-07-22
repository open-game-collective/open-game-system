import type {
  ChannelEntity,
  MessageContentBlock,
  MessageEvent,
} from '@schema/types';
import { createContext } from 'react';

export const BlockContext = createContext(
  {} as {
    block: MessageContentBlock;
    message: MessageEvent;
    channelEntity: ChannelEntity;
  }
);
