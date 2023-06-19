import {
  transformer,
  trpc,
  waitForCondition,
} from '@explorers-club/api-client';
import * as objectify from 'geoposition-to-object';
import type { PersistentProps } from '@explorers-club/schema';
import type {
  ConnectionEntity,
  Entity,
  InitializedConnectionEntity,
  RouteProps,
  SnowflakeId,
} from '@explorers-club/schema';
import { App } from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWSClient, loggerLink, wsLink } from '@trpc/client';
import { enablePatches } from 'immer';
import { World } from 'miniplex';
import { atom } from 'nanostores';
import {
  FC,
  ReactNode,
  createContext,
  memo,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { LayoutProvider } from '@context/LayoutProvider';
import { WorldContext, WorldProvider } from '@context/WorldProvider';
import { ApplicationContext } from '@context/ApplicationContext';
import { ThreeJSOverlayView } from '@googlemaps/three';

enablePatches();

export const ApplicationProvider: FC<{
  trpcUrl: string;
  initialRouteProps: RouteProps;
  initialPersistentProps: PersistentProps;
}> = ({ trpcUrl, initialRouteProps, initialPersistentProps }) => {
  const [world] = useState(new World<Entity>());
  const [routeStore] = useState(atom<RouteProps>(initialRouteProps));

  // todo change route story when entites change

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  //   const wsClient$ = new Subject<{ type: 'OPEN'; wsClient: ReturnType<typeof createWSClient> }>();
  const wsClient = createWSClient({
    url: trpcUrl,
  });

  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer,
      links: [
        /**
         * The function passed to enabled is an example in case you want to the link to
         * log to your console in development and only log errors in production
         */
        loggerLink({
          enabled: (opts) => true,
          // enabled: (opts) =>
          //   (process.env.NODE_ENV === 'development' &&
          //     typeof window !== 'undefined') ||
          //   (opts.direction === 'down' && opts.result instanceof Error),
        }),
        wsLink({
          client: wsClient,
        }),
      ],
    })
  );

  return (
    <ApplicationContext.Provider
      value={{
        routeStore,
      }}
    >
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <LayoutProvider>
            <WorldProvider world={world}>
              <ConnectionProvider
                initialRouteProps={initialRouteProps}
                initialPersistentProps={initialPersistentProps}
              >
                <App initialRouteProps={initialRouteProps} />
              </ConnectionProvider>
            </WorldProvider>
          </LayoutProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </ApplicationContext.Provider>
  );
};

export const ConnectionContext = createContext(
  {} as { myConnectionId?: SnowflakeId }
);

const ConnectionProvider: FC<{
  children: ReactNode;
  initialRouteProps: RouteProps;
  initialPersistentProps: PersistentProps;
}> = memo(({ children, initialRouteProps, initialPersistentProps }) => {
  const { entitiesById, world } = useContext(WorldContext);
  const initializedRef = useRef<boolean>(false);

  const { client } = trpc.useContext();
  const [myConnectionId, setMyConnectionId] = useState<
    SnowflakeId | undefined
  >();

  /**
   * Initializes the connection with websocket server
   */
  useLayoutEffect(() => {
    // If we already fetched it dont do it again
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;

    let timer: NodeJS.Timeout;
    const { accessToken, refreshToken, deviceId } = initialPersistentProps;

    const authTokens =
      accessToken && refreshToken
        ? {
            refreshToken,
            accessToken,
          }
        : undefined;

    client.connection.initialize
      .mutate({ deviceId, authTokens, initialRouteProps })
      .then(async (connectionId) => {
        const entity = (await waitForCondition<ConnectionEntity>(
          world,
          entitiesById,
          connectionId,
          (entity) => entity.states.Initialized === 'True'
        )) as InitializedConnectionEntity;

        navigator.geolocation.watchPosition((p) => {
          const position = objectify(p);

          entity.send({
            type: 'UPDATE_GEOLOCATION_POSITION',
            position,
          });
          console.log(position);
        });

        // entity.send()

        // todo listen for my connection entity and persist it`
        // persistentStore.set({
        //   refreshToken: entity.authTokens.refreshToken,
        //   accessToken: entity.authTokens.accessToken,
        //   deviceId: entity.deviceId,
        // });

        setMyConnectionId(connectionId);
      });
    return () => {
      clearInterval(timer);
    };
  }, [client]);
  console.log({ myConnectionId });

  return (
    <ConnectionContext.Provider value={{ myConnectionId }}>
      {children}
    </ConnectionContext.Provider>
  );
});

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
