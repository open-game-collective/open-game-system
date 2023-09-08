import type { StreamRouter } from '@stream/router';
import { createTRPCProxyClient, createWSClient, wsLink } from '@trpc/client';
import { useState } from 'preact/hooks';
import { useEffect } from 'react';

export default function Receiver() {
  // create persistent WebSocket connection
  const [wsClient] = useState(
    createWSClient({
      url: `ws://localhost:3334`,
    })
  );
  // configure TRPCClient to use WebSockets transport
  const [client] = useState(
    createTRPCProxyClient<StreamRouter>({
      links: [
        wsLink({
          client: wsClient,
        }),
      ],
    })
  );

  useEffect(() => {
    client.onAdd.subscribe(undefined, {
      onData(value) {
        console.log({ value });
      },
    });
  }, [client]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'red',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '50%',
          height: '100%',
          right: 0,
          bottom: 0,
          background: 'orange',
        }}
      ></div>
      <img src="/ogs_final.svg" alt="open game collective" />
    </div>
  );
}
