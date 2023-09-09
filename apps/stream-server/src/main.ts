import { AnyFunction, assert } from '@explorers-club/utils';
import * as mediasoup from 'mediasoup';
import { streamRouter } from '@stream/router';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import * as ws from 'ws';

const port = process.env.PORT || 3334;

const wss = new ws.Server({
  port: 3334,
});

// type WSSHandlerOptions<TRouter extends AnyRouter> = BaseHandlerOptions<
//   TRouter,
//   IncomingMessage
// > &
//   NodeHTTPCreateContextOption<TRouter, IncomingMessage, ws> & {
//     wss: ws.Server;
//     process?: NodeJS.Process;
//   };

// const createContext = (opts: WSSHandlerOptions<typeof appRouter>) => {
//   return {};
// };

const getMediaSoup = (() => {
  let worker: mediasoup.types.Worker<mediasoup.types.AppData>;
  let router: mediasoup.types.Router<mediasoup.types.AppData>;
  let loading = false;
  const callbacks: AnyFunction[] = [];

  // todo fix for if multiple clients call this at once to not re-instantiate
  return async () => {
    if (loading) {
      await new Promise((resolve) => {
        callbacks.push(resolve);
      });
      return { worker, router };
    }

    if (worker && router) {
      return { worker, router };
    }
    loading = true;

    worker = await mediasoup.createWorker({
      logLevel: 'debug',
      rtcMinPort: 44000,
      rtcMaxPort: 45000,
    });

    worker.on('died', () => {
      console.error('mediasoup worker died (this should never happen)');
      process.exit(1);
    });

    // router = await worker.createRouter({
    //   mediaCodecs: [
    //     {
    //       kind: 'audio',
    //       mimeType: 'audio/opus',
    //       clockRate: 48000,
    //       channels: 2,
    //     },
    //     {
    //       kind: 'video',
    //       mimeType: 'video/VP8',
    //       clockRate: 90000,
    //     },
    //   ],
    // });

    loading = false;
    return { worker };
  };
})();

const handler = applyWSSHandler({
  wss,
  router: streamRouter,
  createContext: async (opts) => {
    const { worker } = await getMediaSoup();
    return {
      worker,
    };
  },
});

wss.on('connection', (ws) => {
  console.log(`➕➕ Connection (${wss.clients.size})`);
  ws.once('close', () => {
    console.log(`➖➖ Connection (${wss.clients.size})`);
  });
});
console.log('✅ WebSocket Server listening on ws://localhost:' + port);
process.on('SIGTERM', () => {
  console.log('SIGTERM');
  handler.broadcastReconnectNotification();
  wss.close();
});
