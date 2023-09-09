import { transformer } from '@api/transformer';
import * as mediasoupClient from 'mediasoup-client';
import type { StreamRouter } from '@stream/router';
import { createTRPCProxyClient, createWSClient, wsLink } from '@trpc/client';
import { useEffect } from 'preact/hooks';

export default function Receiver() {
  // create persistent WebSocket connection
  // const [wsClient] = useState(
  // );


  useEffect(() => {
    const wsClient = createWSClient({
      url: `ws://localhost:3334`,
    });
    const client = createTRPCProxyClient<StreamRouter>({
      links: [
        wsLink({
          client: wsClient,
        }),
      ],
      transformer,
    });
    client.state.subscribe(
      { id: 'foo' },
      {
        onData(value) {
          console.log({ value });
        },
      }
    );
    // client.
    // client.onAdd.subscribe(undefined, {
    //   onData(value) {
    //     console.log({ value });
    //   },
    // });
  }, []);

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
