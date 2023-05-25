import type {
  ConnectionEntity,
  InitializedConnectionEntity,
  RouteName,
} from '@explorers-club/schema';
import { myConnectionEntityStore } from '@state/world';
import { atom, computed, onMount } from 'nanostores';

export const currentRouteStore = atom<RouteName>('NotFound');

const getCurrentRouteFromState = (entity: ConnectionEntity) => {
  switch (entity.states.Route) {
    case 'Home':
      return '/';
    case 'Login':
      return '/login';
    case 'NewRoom':
      return '/new';
    case 'Room':
      return `/${entity.currentRoomSlug}`;
    default:
      return '/not-found';
  }
};

const updateUrl = (path: string) => {
  console.log('updating', path);
  if (typeof window !== 'undefined' && path !== window.location.pathname) {
    history.replaceState({}, '', path);
  }
};

myConnectionEntityStore.subscribe((entity) => {
  if (!entity) {
    return;
  }

  currentRouteStore.set(entity.states.Route);
  const path = getCurrentRouteFromState(entity);
  updateUrl(path);
  entity.subscribe(() => {
    currentRouteStore.set(entity.states.Route);
    const path = getCurrentRouteFromState(entity);
    updateUrl(path);
  });
});

// currentRouteStore.subscribe((route) => {
//   switch (route) {
//     case "Home"
//   }
// });

/**
 * Set up two-way reactive syncing of route
 */
// currentRouteStore.subscribe(() => {
//   console.log("LISTENING!", currentRouteStore.get())
//   myConnectionEntityStore.listen((connectionEntity) => {
//     if (!connectionEntity) {
//       return;
//     }
//     console.log("SUBSCRIBING TO ENTITY!")
//     return connectionEntity.subscribe(() => {
//       console.log(connectionEntity.states);
//       currentRouteStore.set(connectionEntity.states.Route);
//     });
//   });
// });

// onMount(currentRouteStore, () => {
//   myConnectionEntityStore.listen((connectionEntity) => {
//     if (!connectionEntity) {
//       return;
//     }
//     const unsub = connectionEntity.subscribe(() => {
//       // TODO only set if change?
//       currentRouteStore.set(connectionEntity.states.Route);
//     });

//     return unsub;
//   });
// });
