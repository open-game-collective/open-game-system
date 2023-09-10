import { transformer } from '@api/transformer';
import { assert } from '@explorers-club/utils';
import type { StreamRouter } from '@stream/router';
import {
  createTRPCProxyClient,
  createWSClient,
  loggerLink,
  wsLink,
} from '@trpc/client';
import * as mediasoup from 'mediasoup-client';
import type { Consumer } from 'mediasoup-client/lib/Consumer';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';

interface VideoElementWithConsumer extends HTMLVideoElement {
  consumer: Consumer;
}

export default function Receiver() {
  const videoRef = useRef<VideoElementWithConsumer>(null);
  const [active, setActive] = useState(false);
  // create persistent WebSocket connection
  // const [wsClient] = useState(
  // );

  useEffect(() => {
    (async () => {
      const wsClient = createWSClient({
        url: `ws://localhost:3334`,
      });
      const client = createTRPCProxyClient<StreamRouter>({
        links: [
          /**
           * The function passed to enabled is an example in case you want to the link to
           * log to your console in development and only log errors in production
           */
          loggerLink({
            enabled: (opts) =>
              (process.env.NODE_ENV === 'development' &&
                typeof window !== 'undefined') ||
              (opts.direction === 'down' && opts.result instanceof Error),
          }),
          wsLink({
            client: wsClient,
          }),
        ],
        transformer,
      });

      // Listen for changes asychronously
      client.state.subscribe(
        { id: 'foo' },
        {
          onData(value) {
            console.log('state value', value);
          },
        }
      );

      // Signal intent to watch stream
      const { routerRtpCapabilities } = await client.joinStream.mutate({
        id: 'foo',
      });

      // Load device info
      const device = new mediasoup.Device();
      if (!device.loaded) {
        await device.load({ routerRtpCapabilities });
      }

      // Create the transport to receive the stream transport
      const { transportOptions } = await client.createTransport.mutate({
        streamId: 'foo',
      });
      const transport = device.createRecvTransport(transportOptions);

      transport.on('connect', async ({ dtlsParameters }, callback) => {
        await client.connectTransport.mutate({
          streamId: 'foo',
          dtlsParameters,
        });

        callback();
      });

      // Consuem the audio and video tracks
      const trackConsumerParameters = await client.receiveTracks.mutate({
        id: 'foo',
        rtpCapabilities: device.rtpCapabilities,
      });

      const videoConsumer = await transport.consume(
        trackConsumerParameters.videoTrack
      );

      // Now we're ready, ask it to send us media
      await client.resumeConsumer.mutate({
        streamId: 'foo',
        consumerId: videoConsumer.id,
      });
      await videoConsumer.resume();

      // const el = document.createElement<'video'>(
      //   'video'
      // ) as VideoElementWithConsumer;
      const videoEl = videoRef.current;
      assert(videoEl, 'expected ref to videoEl');

      videoEl.srcObject = new MediaStream([videoConsumer.track.clone()]);
      videoEl.consumer = videoConsumer;
      console.log({ videoEl });
    })();
  }, [videoRef]);

  const play = useCallback(() => {
    setActive(true);
    videoRef.current?.play().then(() => {
      console.log('PLAY!');
    });
  }, [setActive, videoRef]);

  return (
    <>
      {!active && <button onClick={play}>Play</button>}
      {!active && <img src="/ogs_final.svg" alt="open game collective" />}
      <video
        style={{
          visibility: !active ? 'hidden' : 'visible',
          position: 'absolute',
          inset: 0,
        }}
        playsInline
        ref={videoRef}
      />
    </>
  );
}
