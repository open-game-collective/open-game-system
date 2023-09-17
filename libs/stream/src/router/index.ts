import { TRPCContext } from '@stream/context';
import crypto from 'crypto';
import { initStream, launch } from '@stream/lib/puppeteer';
import { initTRPC } from '@trpc/server';
import { observable } from '@trpc/server/observable';
import * as JWT from 'jsonwebtoken';
import { ReplaySubject } from 'rxjs';
import transformer from 'superjson';
import { z } from 'zod';

const envSchema = z.object({
  PUBLIC_STRIKERS_GAME_WEB_URL: z.string(),
});

const { PUBLIC_STRIKERS_GAME_WEB_URL } = envSchema.parse(process.env);

// const t = initTRPC.create();
const t = initTRPC.context<TRPCContext>().create({
  transformer,
  errorFormatter({ shape }) {
    return shape;
  },
});

const peersByStreamId = new Map<string, ReplaySubject<string>>();

export const streamRouter = t.router({
  // connect: t.procedure
  //   .input(
  //     z.object({
  //       peerId: z.string(),
  //     })
  //   )
  // .mutation(async ({ input, ctx }) => {
  //   const { peerId } = input;
  //   const { streamId } = ctx;

  //   let peerId$ = peersByStreamId.get(streamId);
  //   if (!peerId$) {
  //     peerId$ = new ReplaySubject();
  //     peersByStreamId.set(streamId, peerId$);

  //     // todo: open puppeteer to initialize the stream
  //     const browser = await launch({
  //       channel: 'chrome',
  //       defaultViewport: {
  //         width: 1920,
  //         height: 1080,
  //       },
  //       // args: ['--headless=new', '--no-sandbox', '--disable-setuid-sandbox'],
  //     });
  //     const page = await browser.newPage();
  //     // set user agent (override the default headless User Agent)
  //     await page.setUserAgent('OGS HLS-Server v0.0.1');
  //   }

  //   peerId$.next(peerId);

  //   return { success: true };
  // }),
  run: t.procedure.subscription(({ input, ctx }) => {
    console.log('RUN!');
    return observable((emit) => {
      console.log('returned obs');
      // create a new peer id
      const srcPeerId = crypto.randomUUID();
      console.log({ srcPeerId });

      // todo dedupe these...
      // launch puppeteer stream if it hasn't already been launched
      (async () => {
        console.log('launching borwser');
        const browser = await launch({
          channel: 'chrome',
          defaultViewport: {
            width: 1920,
            height: 1080,
          },
          args: ['--headless=new', '--no-sandbox', '--disable-setuid-sandbox'],
        });
        console.log('opening page');
        const page = await browser.newPage();
        // set user agent (override the default headless User Agent)
        await page.setUserAgent('OGS HLS-Server v0.0.1');

        // todo how do we know which website to go ?
        // use the streamId and token here
        const { streamToken } = ctx;
        const url = getStreamUrl(streamToken);
        console.log('got url', url);
        assert(url, 'expected streamUrl in streamToken' + streamToken);
        console.log(' going to', url);
        await page.goto(url);

        await initStream(
          {
            srcPeerId,
            destPeerId: ctx.peerId,
          },
          page,
          {
            audio: true,
            video: true,
          }
        );
      })();

      return () => {
        // todo close+cleanup the stream...
      };
    });
  }),
});

export type StreamRouter = typeof streamRouter;

const getStreamUrl = (token: string) => {
  const parsed = JWT.verify(token, 'my_private_key');
  if (
    typeof parsed === 'object' &&
    parsed &&
    'url' in parsed &&
    typeof parsed['url'] === 'string'
  ) {
    return parsed['url'];
  }
  return null;
};

function assert<T>(expression: T, errorMessage: string): asserts expression {
  if (!expression) {
    throw new Error(errorMessage);
  }
}
