import type { LayoutProps, RouteName } from '@explorers-club/schema';
import { atom } from 'nanostores';

const defaultLayoutPropsByRoute: Record<RouteName, LayoutProps> = {
  Home: {
    focusArea: {},
  },
  NewRoom: {
    focusArea: {
      MainPanel: true,
    },
  },
  Room: {
    focusArea: {},
  },
};

export const layoutPropsStore = atom<LayoutProps>({
  focusArea: {},
});

export const isMenuOpenStore = atom<boolean>(false);
