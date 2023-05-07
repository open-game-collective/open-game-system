import {
  transformer,
  trpc,
  waitForCondition,
} from '@explorers-club/api-client';
import { useContext, useRef } from 'react';
import { ConnectionEntity, SnowflakeId } from '@explorers-club/schema';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWSClient, wsLink, loggerLink } from '@trpc/client';
import {
  FC,
  ReactNode,
  createContext,
  memo,
  useLayoutEffect,
  useState,
} from 'react';
import { WorldContext, WorldProvider } from '../../context/WorldProvider';
import { enablePatches } from 'immer';
enablePatches();

// type WsClient = ReturnType<typeof createWSClient>;

export const Room: FC<{ slug: string }> = ({ slug }) => {
  const handlePressButton = () => {
    console.log('ress');
  };

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

  // const wsClient$ = new Subject<{ type: 'OPEN'; wsClient: WsClient }>();
  const wsClient = createWSClient({
    url: `ws://localhost:3001`,
    onOpen() {
      // wsClient$.next({ type: 'OPEN', wsClient });
    },
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
          <ConnectionProvider>
            <button onClick={handlePressButton}>{slug}</button>
          </ConnectionProvider>
        </WorldProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
};

const ConnectionContext = createContext({} as { myConnectionId?: SnowflakeId });

const ConnectionProvider: FC<{
  children: ReactNode;
}> = memo(({ children }) => {
  const { world } = useContext(WorldContext);
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
        console.log('WAITING FOR CONDITION!');
        const entity = await waitForCondition<ConnectionEntity>(
          connectionId,
          (entity) => entity.states.Initialized === 'True'
        );
        console.log(entity);

        // localStorage.setItem('refreshToken', data.authTokens.refreshToken);
        // localStorage.setItem('accessToken', data.authTokens.accessToken);
        // localStorage.setItem('deviceId', data.deviceId);

        // window.addEventListener('popstate', () => {
        //   client.connection.navigate.mutate({ location: window.location.href });
        // });

        // timer = setInterval(() => {
        //   client.connection.heartbeat.mutate(undefined).then(noop);
        // }, 100);

        // const { connectionId } = data;
        console.log(connectionId);

        setMyConnectionId(connectionId);

        console.log(Array.from(world.entities));
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

export const useConnection = () => {
  const { world } = useContext(WorldContext);
};
