import type {
    ConnectionEntity,
    RouteName
} from '@explorers-club/schema';
  // import { myConnectionEntityStore } from '@state/world';
  import { Atom, atom } from 'nanostores';
import { FC, ReactNode, createContext, useEffect, useState } from 'react';
  
  export const NavigationContext = createContext(
    {} as {
      currentRouteStore: Atom<RouteName>;
    }
  );
  
  export const NavigationProvider: FC<{ children: ReactNode }> = ({
    children,
  }) => {
    const [currentRouteStore] = useState(atom<RouteName>('NotFound'));
  
    useEffect(() => {
    //   return currentRouteStore.
  
    }, [currentRouteStore])
  
    return (
      <NavigationContext.Provider
        value={{
          currentRouteStore,
        }}
      >
        {children}
      </NavigationContext.Provider>
    );
  };
  
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
    if (typeof window !== 'undefined' && path !== window.location.pathname) {
      history.replaceState({}, '', path);
    }
  };
  
  // const maybeUpdateRoute = (entity: ConnectionEntity) => {
  //   if (
  //     entity.states.Initialized === 'True' &&
  //     entity.states.Route !== 'Uninitialized'
  //   ) {
  //     currentRouteStore.set(entity.states.Route);
  //     const path = getCurrentRouteFromState(entity);
  //     updateUrl(path);
  //   }
  // };
  
  // myConnectionEntityStore.subscribe((entity) => {
  //   if (!entity) {
  //     return;
  //   }
  
  //   maybeUpdateRoute(entity);
  //   entity.subscribe(() => {
  //     maybeUpdateRoute(entity);
  //   });
  // });
  
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
  