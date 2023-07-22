import { WritableAtom } from 'nanostores';
import { createContext } from 'react';

export const LayoutContext = createContext(
  {} as {
    isMenuOpenStore: WritableAtom<boolean>;
    isMainSceneFocusedStore: WritableAtom<boolean>;
    isMainPanelFocusedStore: WritableAtom<boolean>;
    isChannelListOpenStore: WritableAtom<boolean>;
  }
);
