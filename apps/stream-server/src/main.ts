import { AnyFunction, assert } from '@explorers-club/utils';
import { v4 as uuidv4 } from 'uuid';
import * as mediasoup from 'mediasoup';
import { streamRouter } from '@stream/router';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import * as ws from 'ws';
import { IncomingMessage } from 'http';

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

interface ExtendedWebSocket extends WebSocket {
  id?: string;
}

wss.on('connection', (ws: ExtendedWebSocket, req: IncomingMessage) => {
  ws.id = uuidv4();
  console.log(`Client connected with ID: ${ws.id}`);

  // ws.on('message', (message: string) => {
  //   // Handle messages, potentially using more interfaces/types to define the structure
  //   // E.g., type Message = { type: string; payload: any; };
  //   const data = JSON.parse(message);
  //   if (data.type === 'exampleType') {
  //     // Do something with data.payload
  //   }
  // });
});

// wss.on('connection', (ws, req) => {
//   ws.id
//   // try {
//   //   assert(req.url, 'expected url to be able to parse for accessToken');

//   //   const url = new URL(req.url, `ws://${req.headers.host}`);
//   //   const accessToken = url.searchParams.get('accessToken');
//   //   assert(accessToken, 'failed to parse for accessToken');

//   //   const verifiedToken = JWT.verify(accessToken, 'my_private_key');

//     // const { sub } = ConnectionAccessTokenPropsSchema.parse(verifiedToken);

//     // Keep sending heartbeat as long as this connetion stays alive...
//     req

//     // const HEARTBEAT_TIMEOUT = 5000; // 5s
//     // const interval = setInterval(() => {
//     //   entity.send({
//     //     type: 'HEARTBEAT',
//     //   });
//     // }, HEARTBEAT_TIMEOUT);

//     ws.once('close', () => {
//       entity.send({
//         type: 'DISCONNECT',
//       });
//       // clearInterval(interval);
//     });
//   } catch (ex) {
//     console.warn(
//       'warning: error when trying to initialize websocket. client commands will fail'
//     );
//   }
// });

const handler = applyWSSHandler({
  wss,
  router: streamRouter,
  createContext: async (opts) => {
    const { worker } = await getMediaSoup();
    assert('id' in opts.res, 'expected id on websocket in context');

    return {
      worker,
      connectionId: opts.res.id as string,
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
