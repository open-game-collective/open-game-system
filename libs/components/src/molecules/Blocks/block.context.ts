import type { MessageContentBlock, MessageEvent } from '@schema/types';
import { createContext } from 'react';

export const BlockContext = createContext(
  {} as {
    block: MessageContentBlock;
    message: MessageEvent;
  }
);
