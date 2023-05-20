import type { LayoutIsland, LayoutProps, RouteName, RouteProps } from '@explorers-club/schema';
import { atom } from 'nanostores';

const defaultLayoutPropsByRoute: Record<RouteName, LayoutProps> = {
  Home: {
    focusArea: []
  },
  NewRoom: {
    focusArea: ["MainPanel"]
  },
  Room: {
    focusArea: []
  },
};

// How do I calculate the focus area

// export const focusAreasStore = atom<Set<LayoutIsland>>(new Set());

// const routeStore = atom<RouteProps>();

// const modalIsOpenStore = computed(myInitializedConnectionEntityStore, (entity) => {
//   return entity?.states.Route
// })

// export const modalIsOpenStore = computed(
//   layoutPropsStore,
//   (layoutProps) => layoutProps.modal.open
// );

// export const menuIsOpenStore = computed(
//   layoutPropsStore,
//   (layoutProps) => layoutProps.menu.open
// );
