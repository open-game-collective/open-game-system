import { useStore } from '@nanostores/react';
import type { FC, ReactNode } from 'react';
import { isMainPanelFocusedStore } from '../state/layout';

export const Chat = () => {
  const mainPanelFocused = useStore(isMainPanelFocusedStore);
  if (mainPanelFocused) {
    return null;
  }

  return <div>chat</div>;
};
