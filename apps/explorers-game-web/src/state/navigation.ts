import type { RouteName } from '@explorers-club/schema';
import { myConnectionEntityStore } from '@state/world';
import { atom, onMount } from 'nanostores';

export const currentRouteStore = atom<RouteName>('NotFound');

/**
 * Set up two-way reactive syncing of route
 */
currentRouteStore.subscribe(() => {
  myConnectionEntityStore.listen((connectionEntity) => {
    if (!connectionEntity) {
      return;
    }
    return connectionEntity.subscribe(() => {
      currentRouteStore.set(connectionEntity.states.Route);
    });
  });
});

onMount(currentRouteStore, () => {
  myConnectionEntityStore.listen((connectionEntity) => {
    if (!connectionEntity) {
      return;
    }
    const unsub = connectionEntity.subscribe(() => {
      // TODO only set if change?
      currentRouteStore.set(connectionEntity.states.Route);
    });

    return unsub;
  });
});
