import { ApplicationContext } from '@context/ApplicationContext';
import { LayoutProvider } from '@context/LayoutProvider';
import { WorldProvider } from '@context/WorldProvider';
import { transformer, trpc } from '@explorers-club/api-client';
import type { Entity, RouteProps, SnowflakeId } from '@explorers-club/schema';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWSClient, loggerLink, wsLink } from '@trpc/client';
import { enablePatches } from 'immer';
import { World } from 'miniplex';
import { atom } from 'nanostores';
import { FC, ReactNode, createContext, useState } from 'react';

enablePatches();

export const ApplicationProvider: FC<{
  trpcUrl: string;
  initialRouteProps: RouteProps;
  connectionId: string;
  children: ReactNode;
}> = ({ trpcUrl, initialRouteProps, connectionId, children }) => {
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
              <ConnectionContext.Provider
                value={{ myConnectionId: connectionId }}
              >
                {children}
              </ConnectionContext.Provider>
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

// const getCurrentRouteFromState = (entity: ConnectionEntity) => {
//   switch (entity.states.Route) {
//     case 'Home':
//       return '/';
//     case 'Login':
//       return '/login';
//     case 'NewRoom':
//       return '/new';
//     case 'Room':
//       return `/${entity.currentRoomSlug}`;
//     default:
//       return '/not-found';
//   }
// };

// const updateUrl = (path: string) => {
//   if (typeof window !== 'undefined' && path !== window.location.pathname) {
//     history.replaceState({}, '', path);
//   }
// };
