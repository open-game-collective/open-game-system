import type { LayoutProps, RouteName } from '@explorers-club/schema';
import { atom } from 'nanostores';
import { FC, ReactNode, useContext, useMemo, useState } from 'react';
import { ApplicationContext } from './ApplicationContext';
import { LayoutContext } from './LayoutContext';

export const LayoutProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { routeStore } = useContext(ApplicationContext);

  const defaults = useMemo(
    () => defaultLayoutPropsByRoute[routeStore.get().name],
    [routeStore]
  );

  const [isMenuOpenStore] = useState(() => {
    return atom<boolean>(false);
  });
  const [isMainPanelFocusedStore] = useState(() => {
    return atom<boolean>(defaults.focusArea === 'MainScene');
  });
  const [isMainSceneFocusedStore] = useState(() => {
    return atom<boolean>(defaults.focusArea === 'MainPanel');
  });
  const [isChannelListOpenStore] = useState(() => atom<boolean>(false));

  return (
    <LayoutContext.Provider
      value={{
        isMenuOpenStore,
        isMainPanelFocusedStore,
        isMainSceneFocusedStore,
        isChannelListOpenStore,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

const defaultLayoutPropsByRoute: Record<RouteName, LayoutProps> = {
  Uninitialized: {},
  Home: {},
  New: {
    focusArea: 'MainPanel',
  },
  Login: {
    focusArea: 'MainPanel',
  },
  Room: {},
  NotFound: {},
};
