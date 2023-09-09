import { initTRPC } from '@trpc/server';
import { observable } from '@trpc/server/observable';
import ffmpeg from 'fluent-ffmpeg';
import { AppData, Router, Worker } from 'mediasoup/node/lib/types';
// import { map, type MapStore } from 'nanostores';
// import type { MapStore } from 'nanostores';
// import { map } from 'nanostores';
import { getStream, launch } from 'puppeteer-stream';
import { z } from 'zod';
// import { assert } from '@explorers-club/utils';
import { TRPCContext } from '@stream/context';
import transformer from 'superjson';
// import { generateSnowflakeId } from '@api/ids';

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

const StreamIdSchema = z.string();

const PeerSchema = z.object({
  joinTs: z.date(),
  lastSeenTs: z.date(),
  media: z.any(),
  consumerLayers: z.any(),
  stats: z.any(),
});

const PeersSchema = z.array(PeerSchema);
type Peers = z.infer<typeof PeersSchema>;

type StreamInfo = {
  id: z.infer<typeof StreamIdSchema>;
  peers: Peers;
  router: Router<AppData>;
};

// type StreamInfoMap = MapStore<StreamInfo>;

const streamInfoMap = new Map<string, StreamInfo>();

type PublicStreamState = {
  id: string;
};

const streamCreationInProgress: Set<string> = new Set();
const streamCreationCallbacks: Map<string, Array<() => void>> = new Map();

const getStreamInfo = async ({
  id,
  worker,
}: {
  id: string;
  worker: Worker<AppData>;
}) => {
  // Check if stream info is already available.
  if (streamInfoMap.has(id)) {
    return streamInfoMap.get(id);
  }

  // If another request is already creating the stream, wait for it.
  if (streamCreationInProgress.has(id)) {
    await new Promise<void>((resolve) => {
      if (!streamCreationCallbacks.has(id)) {
        streamCreationCallbacks.set(id, []);
      }
      streamCreationCallbacks.get(id)!.push(resolve);
    });
    return streamInfoMap.get(id);
  }

  streamCreationInProgress.add(id);

  // ... [The rest of your code for stream creation here] ...
  const router = await worker.createRouter({
    mediaCodecs: [
      {
        kind: 'audio',
        mimeType: 'audio/opus',
        clockRate: 48000,
        channels: 2,
      },
      {
        kind: 'video',
        mimeType: 'video/VP8',
        clockRate: 90000,
      },
    ],
  });

  const audioTransport = await router.createPlainTransport({
    listenIp: '127.0.0.1',
    rtcpMux: false,
    comedia: true,
  });
  const audioRtpPort = audioTransport.tuple.localPort;
  // => 3301

  // Read the transport local RTCP port.
  const audioRtcpPort = audioTransport.rtcpTuple?.localPort;
  assert(audioRtcpPort, 'expected audioRtcpPort');

  const videoTransport = await router.createPlainTransport({
    listenIp: '127.0.0.1',
    rtcpMux: false,
    comedia: true,
  });

  const videoRtpPort = videoTransport.tuple.localPort;
  const videoRtcpPort = videoTransport.rtcpTuple?.localPort;
  assert(videoRtcpPort, 'expected videoRtcpprt');

  const audioProducer = await audioTransport.produce({
    kind: 'audio',
    rtpParameters: {
      codecs: [
        {
          mimeType: 'audio/opus',
          clockRate: 48000,
          payloadType: 101,
          channels: 2,
          rtcpFeedback: [],
          parameters: { 'sprop-stereo': 1 },
        },
      ],
      encodings: [{ ssrc: 11111111 }],
    },
  });

  const videoProducer = await videoTransport.produce({
    kind: 'video',
    rtpParameters: {
      codecs: [
        {
          mimeType: 'video/vp8',
          clockRate: 90000,
          payloadType: 102,
          rtcpFeedback: [], // FFmpeg does not support NACK nor PLI/FIR.
        },
      ],
      encodings: [{ ssrc: 22222222 }],
    },
  });

  const browser = await launch({
    // executablePath,
    channel: 'chrome',
    // https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md see for details about no-sandbox, might need to adjust Dockerfile
    args: ['--headless=new', '--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  });
  const page = await browser.newPage();
  // const refreshToken = JWT.sign(
  //   {
  //     sessionId: '',
  //     deviceId: '',
  //   },
  //   'my_private_key',
  //   {
  //     subject: '',
  //     audience: 'STRIKERS_GAME_WEB',
  //     issuer: 'HLS_SERVER',
  //     expiresIn: '30d',
  //   }
  // );
  // const domain = PUBLIC_STRIKERS_GAME_WEB_URL.replace('https://', ''); // Make sure the domain matches the site you navigated to
  // await page.setCookie({
  //   name: 'refreshToken',
  //   value: refreshToken,
  //   domain, // Make sure the domain matches the site you navigated to
  //   expires: Date.now() / 1000 + 90 * 24 * 60 * 60, // 90 days
  //   // There are other optional properties too, like secure, httpOnly, etc.
  // });
  // set user agent (override the default headless User Agent)
  await page.setUserAgent('OGS HLS-Server v0.0.1');
  await page.goto('https://opengame.org');

  // For some reason screencast fails if started too early
  await new Promise<null>((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, 2000);
  });

  const stream = await getStream(page, { audio: true, video: true });

  await new Promise((resolve) => {
    ffmpeg(stream)
      // .withNativeFramerate()
      .outputOptions([
        '-map 0:a:0',
        '-acodec libopus',
        '-ab 128k',
        '-ac 2',
        '-ar 48000',
        '-map 0:v:0',
        '-pix_fmt yuv420p',
        '-c:v libvpx',
        '-b:v 1000k',
        '-deadline realtime',
        '-cpu-used 4',
      ])
      // .on('progress', (progressData) => {
      //   console.log({ progressData });
      // })
      .on('start', () => {
        resolve(null);
      })
      .on('error', (err, stdout, stderr) => {
        console.warn(err, stdout, stderr);
      })
      .outputFormat('tee')
      .save(
        `[select=a:f=rtp:ssrc=11111111:payload_type=101]rtp://127.0.0.1:${audioRtpPort}?rtcpport=${audioRtcpPort}|[select=v:f=rtp:ssrc=22222222:payload_type=102]rtp://127.0.0.1:${videoRtpPort}?rtcpport=${videoRtcpPort}`
      );
  });

  const streamInfo = {
    id,
    peers: [],
    router,
  };
  streamInfoMap.set(id, streamInfo);

  // Notify any waiting callbacks.
  if (streamCreationCallbacks.has(id)) {
    for (const callback of streamCreationCallbacks.get(id)!) {
      callback();
    }
    streamCreationCallbacks.delete(id);
  }

  streamCreationInProgress.delete(id);

  return streamInfoMap.get(id);
};

export const streamRouter = t.router({
  /**
   * JoinStream mutation
   *
   * Adds the peer to the roomState data structure and creates a
   * transport that the peer will use for receiving media. returns
   * router rtpCapabilities for mediasoup-client device initialization
   */
  joinStream: t.procedure
    .input(
      z.object({
        id: StreamIdSchema,
      })
    )
    .mutation(({ ctx, input }) => {
      const { id } = input;
      // launch ffmpeg here...
      const { worker } = ctx;
      console.log({ worker });
      getStreamInfo({ id, worker }).then(() => {
        console.log('GOT STREAM!');
      });

      return {};
    }),

  /**
   * State subscription
   *
   * Allows a client to subscribe to updates of the state tree for a given stream
   */
  state: t.procedure
    .input(
      z.object({
        id: StreamIdSchema,
      })
    )
    .subscription(({ input, ctx }) => {
      const { id } = input;
      const { worker } = ctx;
      console.log({ worker });

      // return an `observable` with a callback which is triggered immediately
      return observable<PublicStreamState>((emit) => {
        getStreamInfo({ id, worker }).then((streamInfo) => {
          emit.next({
            id,
          });
          console.log('GOT STREAM!', streamInfo);
        });
        return () => {};
      });
    }),
  // sendTrack: t.procedure
  //   .input(
  //     z.object({
  //       id: z.string().uuid().optional(),
  //       text: z.string().min(1),
  //     })
  //   )
  //   .mutation(async (opts) => {
  //     const post = { ...opts.input }; /* [..] add to db */
  //     // ee.emit('add', post);
  //     return post;
  //   }),
});

export type StreamRouter = typeof streamRouter;

function assert<T>(expression: T, errorMessage: string): asserts expression {
  if (!expression) {
    throw new Error(errorMessage);
  }
}
