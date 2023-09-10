import { TRPCContext } from '@stream/context';
import { initTRPC } from '@trpc/server';
import { observable } from '@trpc/server/observable';
import ffmpeg from 'fluent-ffmpeg';
import { produce } from 'immer';
import {
  AppData,
  Consumer,
  DtlsParameters,
  PlainTransport,
  Producer,
  Router,
  RtpCapabilities,
  Transport,
  Worker,
} from 'mediasoup/node/lib/types';
import { getStream, launch } from 'puppeteer-stream';
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

const StreamIdSchema = z.string();

const StreamClientSchema = z.object({
  joinTs: z.date(),
  lastSeenTs: z.date(),
  media: z.record(
    z.object({
      paused: z.boolean(),
    })
  ),
  consumerLayers: z.any(),
  stats: z.any(),
  transport: z.custom<Transport<AppData>>().optional(),
});

type StreamInfo = {
  id: z.infer<typeof StreamIdSchema>;
  clients: Record<string, z.infer<typeof StreamClientSchema>>;
  consumers: Record<string, Consumer<AppData>>;
  audioProducer: Producer<AppData>;
  audioTransport: PlainTransport<AppData>;
  videoProducer: Producer<AppData>;
  videoTransport: PlainTransport<AppData>;
  router: Router<AppData>;
};

const streamInfoMap = new Map<string, StreamInfo>();

type StreamInfoUpdater = (draft: StreamInfo) => void;

const updateStreamInfo = (streamId: string, updater: StreamInfoUpdater) => {
  const currentStreamInfo = streamInfoMap.get(streamId);

  if (!currentStreamInfo) {
    throw new Error(`StreamInfo for streamId ${streamId} not found`);
  }

  const updatedStreamInfo = produce(currentStreamInfo, updater);
  streamInfoMap.set(streamId, updatedStreamInfo);

  return streamInfoMap.get(streamId)!;
};

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
  let streamInfo = streamInfoMap.get(id);
  if (streamInfo) {
    return streamInfo;
  }

  // If another request is already creating the stream, wait for it.
  if (streamCreationInProgress.has(id)) {
    await new Promise<void>((resolve) => {
      if (!streamCreationCallbacks.has(id)) {
        streamCreationCallbacks.set(id, []);
      }
      streamCreationCallbacks.get(id)!.push(resolve);
    });
    return streamInfoMap.get(id)!;
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
    // paused: true,
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
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    // args: ['--headless=new', '--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  });
  const page = await browser.newPage();
  await page.setUserAgent('OGS StreamServer v0.0.1');
  await page.goto(
    'https://app-opengame-org-web-open-game-system-pr-21.up.railway.app/'
  );

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
      .inputOptions(['-re'])
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

  streamInfo = {
    id,
    clients: {},
    consumers: {},
    router,
    audioProducer,
    audioTransport,
    videoProducer,
    videoTransport,
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

  return streamInfo;
};

export const streamRouter = t.router({
  /**
   * Called from inside a client's `transport.on('connect')` event handler
   */
  connectTransport: t.procedure
    .input(
      z.object({
        streamId: StreamIdSchema,
        dtlsParameters: z.custom<DtlsParameters>(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { dtlsParameters, streamId } = input;
      const { worker } = ctx;

      const streamInfo = await getStreamInfo({ id: streamId, worker });

      // updateStreamInfo(streamId, (draft) => {
      //   draft.clients.find((client) => client.transport)
      // })

      const { transport } = streamInfo.clients[ctx.connectionId];

      // const transport = streamInfo?.transports[input.transportId];
      assert(transport, 'expected transport');
      await transport.connect({ dtlsParameters });

      return { connected: true };
    }),

  /**
   * Create a mediasoup transport object and send back info needed
   * to create a transport object on the client side
   */
  createTransport: t.procedure
    .input(z.object({ streamId: StreamIdSchema }))
    .mutation(async ({ input, ctx }) => {
      const { streamId } = input;
      const { worker, connectionId } = ctx;
      const { router } = await getStreamInfo({ id: streamId, worker });
      const transport = await router.createWebRtcTransport({
        listenIps: [{ ip: '127.0.0.1' }],
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
        // initialAvailableOutgoingBitrate: initialAvailableOutgoingBitrate,
        appData: { peerId: connectionId, clientDirection: 'recv' },
      });
      updateStreamInfo(streamId, (draft) => {
        draft.clients[ctx.connectionId].transport = transport;
      });
      const { iceParameters, iceCandidates, dtlsParameters } = transport;

      // let transport = await createWebRtcTransport({ peerId, direction });
      return {
        transportOptions: {
          id: transport.id,
          iceParameters,
          iceCandidates,
          dtlsParameters,
        },
      };
    }),

  resumeConsumer: t.procedure
    .input(z.object({ streamId: StreamIdSchema, consumerId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { worker } = ctx;
      const { consumerId, streamId } = input;

      const streamInfo = await getStreamInfo({ id: streamId, worker });
      const consumer = streamInfo.consumers[consumerId];
      assert(consumer, 'expected consumer');
      // todo assert this consumer is owned by this connectionId

      await consumer.resume();
      return { resumed: true };
    }),

  /**
   * Create a mediasoup consumer object, hook it up to the audio
   * and video producers for the given streamId and send back info
   * needed to create a consumer object on the client side.
   *
   * always start consumers paused, client will request media
   * to resume when the conneciton completes
   */
  receiveTracks: t.procedure
    .input(
      z.object({
        id: StreamIdSchema,
        rtpCapabilities: z.custom<RtpCapabilities>(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { worker, connectionId } = ctx;
      const { id, rtpCapabilities } = input;

      const { clients, audioProducer, videoProducer } = await getStreamInfo({
        id,
        worker,
      });

      const clientInfo = clients[connectionId];
      assert(clientInfo, 'expected clientInfo when trying to get tracks');

      const { transport } = clientInfo;

      assert(transport, 'transport for client not found');

      const consumer = await transport.consume({
        producerId: videoProducer.id,
        rtpCapabilities,
        paused: true, // see note above about always starting paused
        appData: { peerId: ctx.connectionId },
      });

      // need both 'transportclose' and 'producerclose' event handlers,
      // to make sure we close and clean up consumers in all
      // circumstances
      consumer.on('transportclose', () => {
        // log(`consumer's transport closed`, consumer.id);
        // closeConsumer(consumer);
      });
      consumer.on('producerclose', () => {
        // log(`consumer's producer closed`, consumer.id);
        // closeConsumer(consumer);
      });

      updateStreamInfo(id, (draft) => {
        draft.consumers[consumer.id] = consumer;
        draft.clients[connectionId].consumerLayers[consumer.id] = {
          currentLayer: null,
          clientSelectedLayer: null,
        };
      });

      // update above data structure when layer changes.
      consumer.on('layerschange', (layers) => {
        updateStreamInfo(id, (draft) => {
          draft.clients[connectionId].consumerLayers[consumer.id].currentLayer =
            layers && layers.spatialLayer;
        });
      });

      const { kind, rtpParameters, type, producerPaused } = consumer;

      return {
        audioTrack: {},
        videoTrack: {
          id: consumer.id,
          producerId: videoProducer.id,
          kind,
          rtpParameters,
          type,
          producerPaused,
        },
      };
    }),

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
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      // launch ffmpeg here...
      const { worker } = ctx;
      // console.log({ worker });

      const streamInfo = await getStreamInfo({ id, worker });
      const now = new Date();
      updateStreamInfo(id, (draft) => {
        draft.clients[ctx.connectionId] = {
          joinTs: now,
          lastSeenTs: now,
          media: {},
          consumerLayers: {},
          stats: {},
        };
      });

      return { routerRtpCapabilities: streamInfo.router.rtpCapabilities };
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

      // return an `observable` with a callback which is triggered immediately
      return observable<PublicStreamState>((emit) => {
        getStreamInfo({ id, worker }).then((streamInfo) => {
          emit.next({
            id,
          });
          console.log('GOT STREAM!');
        });
        return () => {};
      });
    }),
});

export type StreamRouter = typeof streamRouter;

function assert<T>(expression: T, errorMessage: string): asserts expression {
  if (!expression) {
    throw new Error(errorMessage);
  }
}
