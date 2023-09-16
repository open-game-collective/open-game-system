import { assert } from '@explorers-club/utils';
import { streamRouter } from '@stream/router';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import * as JWT from 'jsonwebtoken';
import * as ws from 'ws';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.number().default(3334),
});

const environment = envSchema.parse(process.env);

const wss = new ws.Server({
  port: environment.PORT,
});

const handler = applyWSSHandler({
  wss,
  router: streamRouter,
  createContext: async (opts) => {
    assert('id' in opts.res, 'expected id on websocket in context');
    assert(opts.req.url, 'expected url in url');
    assert(opts.req.headers.host, 'expected host in request');
    const url = new URL(opts.req.url, `ws://${opts.req.headers.host}`);
    const streamToken = url.searchParams.get('streamToken');
    assert(streamToken, 'expected streamToken');
    const streamId = getStreamId(streamToken);

    return {
      peerId: opts.res.id as string,
      streamId,
    };
  },
});

wss.on('connection', (ws) => {
  console.log(`➕➕ Connection (${wss.clients.size})`);
  ws.once('close', () => {
    console.log(`➖➖ Connection (${wss.clients.size})`);
  });
});
console.log(
  '✅ WebSocket Server listening on ws://localhost:' + environment.PORT
);
process.on('SIGTERM', () => {
  console.log('SIGTERM');
  handler.broadcastReconnectNotification();
  wss.close();
});

const getStreamId = (token: string) => {
  const parsed = JWT.verify(token, 'my_private_key');
  return parsed.sub as string;
};
