import {
  transformer,
  trpc,
  waitForCondition,
} from '@explorers-club/api-client';
import {
  ConnectionEntity,
  InitializedConnectionEntity,
  RouteProps,
  SnowflakeId,
} from '@explorers-club/schema';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWSClient, loggerLink, wsLink } from '@trpc/client';
import { enablePatches } from 'immer';
import { WritableAtom, atom } from 'nanostores';
import {
  FC,
  ReactNode,
  createContext,
  memo,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { PersistentProps } from '@explorers-club/schema';
import { WorldProvider } from './WorldProvider';
enablePatches();

export const ApplicationProvider: FC<{
  children: ReactNode;
  trpcUrl: string;
  initialRouteProps: RouteProps;
  initialPersistentProps: PersistentProps;
}> = ({ children, trpcUrl, initialRouteProps, initialPersistentProps }) => {
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
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <WorldProvider>
          <ConnectionProvider
            initialRouteProps={initialRouteProps}
            initialPersistentProps={initialPersistentProps}
          >
            {children}
          </ConnectionProvider>
        </WorldProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
};

const ConnectionContext = createContext({} as { myConnectionId?: SnowflakeId });

const ConnectionProvider: FC<{
  children: ReactNode;
  initialRouteProps: RouteProps;
  initialPersistentProps: PersistentProps;
}> = memo(({ children, initialRouteProps, initialPersistentProps }) => {
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
          connectionId,
          (entity) => entity.states.Initialized === 'True'
        )) as InitializedConnectionEntity;

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

  return (
    <ConnectionContext.Provider value={{ myConnectionId }}>
      {children}
    </ConnectionContext.Provider>
  );
});
