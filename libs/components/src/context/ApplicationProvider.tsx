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
import {
  FC,
  ReactNode,
  createContext,
  memo,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { WorldProvider } from './WorldProvider';
enablePatches();

export const ApplicationProvider: FC<{
  children: ReactNode;
  trpcUrl: string;
}> = ({ children, trpcUrl }) => {
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
          <ConnectionProvider>{children}</ConnectionProvider>
        </WorldProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
};

const ConnectionContext = createContext({} as { myConnectionId?: SnowflakeId });

const ConnectionProvider: FC<{
  children: ReactNode;
}> = memo(({ children }) => {
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
    // todo use encrypted storage
    const refreshToken = localStorage.getItem('refreshToken') || undefined;
    const accessToken = localStorage.getItem('accessToken') || undefined;
    const deviceId = localStorage.getItem('deviceId') || undefined;

    const authTokens =
      refreshToken && accessToken ? { refreshToken, accessToken } : undefined;

    client.connection.initialize
      .mutate({ deviceId, authTokens, initialLocation: window.location.href })
      .then(async (connectionId) => {
        const entity = (await waitForCondition<ConnectionEntity>(
          connectionId,
          (entity) => entity.states.Initialized === 'True'
        )) as InitializedConnectionEntity;

        localStorage.setItem('refreshToken', entity.authTokens.refreshToken);
        localStorage.setItem('accessToken', entity.authTokens.accessToken);
        localStorage.setItem('deviceId', entity.deviceId);

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
