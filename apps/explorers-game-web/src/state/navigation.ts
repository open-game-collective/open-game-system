import type { RouteName } from '@explorers-club/schema';
import { myConnectionEntityStore } from '@state/world';
import { atom, onMount } from 'nanostores';

export const currentRouteStore = atom<RouteName>('Home');

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
