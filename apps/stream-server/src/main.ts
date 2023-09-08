import { streamRouter } from '@stream/router';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import ws from 'ws';

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

const handler = applyWSSHandler({
  wss,
  router: streamRouter,
  createContext({ req, res }) {
    return {};
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
