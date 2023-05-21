import { atom, computed, onMount } from 'nanostores';
import { currentRouteStore } from './navigation';
import type { LayoutProps, RouteName } from '@explorers-club/schema';

const defaultLayoutPropsByRoute: Record<RouteName, LayoutProps> = {
  Home: {},
  NewRoom: {
    focusArea: 'MainPanel',
  },
  Room: {},
};

export const isMenuOpenStore = atom<boolean>(false);
export const isMainSceneFocusedStore = atom<boolean>(false);
export const isMainPanelFocusedStore = atom<boolean>(false);

currentRouteStore.subscribe((route) => {
  const defaults = defaultLayoutPropsByRoute[route];
  isMainSceneFocusedStore.set(defaults.focusArea === 'MainScene');
  isMainPanelFocusedStore.set(defaults.focusArea === 'MainPanel');
});