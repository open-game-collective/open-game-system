// from https://github.com/trpc/trpc/discussions/1980
import * as cors from 'cors';
import {
  ApiRouter,
  apiRouter,
  connectionsByAccessToken,
  createContextHTTP,
  createContextWebsocket,
  entitiesById,
  waitForEntity,
} from '@explorers-club/api';
import { ConnectionAccessTokenPropsSchema } from '@schema/common';
import * as JWT from 'jsonwebtoken';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import * as trpcExpress from '@trpc/server/adapters/express';
import * as http from 'http';
import * as ws from 'ws';

import * as express from 'express';
import { assert } from '@explorers-club/utils';

const app = express();
const server = http.createServer(app);

// web socket server
const wss = new ws.Server({ server });
const wsHandler = applyWSSHandler({
  wss,
  router: apiRouter,
  createContext: createContextWebsocket,
});

// Get the world
// Send connect and disconnect events on the entity
wss.on('connection', (ws, req) => {
  try {
    assert(req.url, 'expected url to be able to parse for accessToken');

    const url = new URL(req.url, `ws://${req.headers.host}`);
    const accessToken = url.searchParams.get('accessToken');
    assert(accessToken, 'failed to parse for accessToken');

    const verifiedToken = JWT.verify(accessToken, 'my_private_key');

    const { sub } = ConnectionAccessTokenPropsSchema.parse(verifiedToken);
    const entity = entitiesById.get(sub);
    assert(entity, 'expected entity from accessToken but not found');
    assert(
      entity.schema === 'connection',
      'expected entity to have schema connection but was: ' + entity.schema
    );

    // Keep sending heartbeat as long as this connetion stays alive...
    const HEARTBEAT_TIMEOUT = 5000; // 5s
    const interval = setInterval(() => {
      entity.send({
        type: 'HEARTBEAT',
      });
    }, HEARTBEAT_TIMEOUT);

    ws.once('close', () => {
      entity.send({
        type: 'DISCONNECT',
      });
      clearInterval(interval);
    });
  } catch (ex) {
    console.warn('warning: when trying to initialize websocket: ' + ex);
    console.warn('client commands will fail');
  }
});

app.use(cors()); // todo might not need
app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware<ApiRouter>({
    router: apiRouter,
    createContext: createContextHTTP,
    // createContext: createContextHTTP,
  })
);

const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);

process.on('SIGTERM', () => {
  wsHandler.broadcastReconnectNotification();
  wss.close();
  server.close();
});

// const wss = new ws.Server({
//   port: 3001,
// });
// const handler = applyWSSHandler({ wss, router: apiRouter, createContext });

// createHTTPServer({
//   router: apiRouter,
//   createContext: async (opts) => {
//     opts.
//     return { ' };
//   },
// }).listen(3002);
// const server = createHTTPServer({
//   router: appRouter,
// });

// wss.on('connection', () => {
//   console.log('connect!');
//   wss.once('close', () => {
//     console.log('connection close');
//   });
// });

// console.log('✅ WebSocket Server listening on ws://localhost:3001');
// process.on('SIGTERM', () => {
//   console.log('SIGTERM');
//   handler.broadcastReconnectNotification();
//   wss.close();
// });

// const app = express();

// app.use(
//   '/api',
//   trpcExpress.createExpressMiddleware({
//     router: apiRouter,
//     createContext,
//   })
// );
// app.use(morgan());
// app.use(cors());

// const port = process.env.port || 3000;
// const server = app.listen(port, () => {
//   console.log(`Listening at http://localhost:${port}/api`);
// });
// server.on('error', console.error);
