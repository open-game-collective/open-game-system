import { WorldProvider } from '@context/WorldProvider';
import { transformer, trpc } from '@explorers-club/api-client';
import type { Entity, SnowflakeId } from '@explorers-club/schema';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWSClient, loggerLink, wsLink } from '@trpc/client';
import { enablePatches } from 'immer';
import { World } from 'miniplex';
import { FC, ReactNode, createContext, useState } from 'react';

enablePatches();

export const ApplicationProvider: FC<{
  apiServerUrl: string;
  connectionId: string;
  children: ReactNode;
}> = ({ apiServerUrl, connectionId, children }) => {
  const [world] = useState(new World<Entity>());

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
    url: apiServerUrl,
  });

  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer,
      links: [
        loggerLink({
          logger(opts) {
            if (opts.direction === 'up') {
              console.log('SEND', opts.type, opts.path, opts.input);
            } else if (opts.direction === 'down') {
              if ('result' in opts.result) {
                if ('data' in opts.result.result) {
                  console.log(
                    'RECV',
                    opts.type,
                    opts.path,
                    opts.result.result.data
                  );
                } else {
                  console.log('RECV', opts.type, opts.path, opts.result.result);
                }
              } else {
                console.log('RECV', opts.type, opts.path);
              }
            }
            return opts;
          },
          /**
           * The function passed to enabled is an example in case you want to the link to
           * log to your console in development and only log errors in production
           */
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
        <WorldProvider world={world} connectionId={connectionId}>
          <ConnectionContext.Provider value={{ myConnectionId: connectionId }}>
            {children}
          </ConnectionContext.Provider>
        </WorldProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
};

export const ConnectionContext = createContext(
  {} as { myConnectionId?: SnowflakeId }
);
