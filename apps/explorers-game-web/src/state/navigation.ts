import type { RouteName } from '@explorers-club/schema';
import { myConnectionEntityStore } from '@state/world';
import { atom, onMount } from 'nanostores';

export const currentRouteStore = atom<RouteName>('NotFound');

myConnectionEntityStore.subscribe((entity) => {
  if (!entity) {
    return;
  }

  currentRouteStore.set(entity.states.Route);
  entity.subscribe(() => {
    currentRouteStore.set(entity.states.Route);
  });
});

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
