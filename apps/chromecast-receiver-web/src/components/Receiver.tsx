import { assert } from '@explorers-club/utils';
import type { StreamRouter } from '@stream/router';
import { createTRPCProxyClient, createWSClient, wsLink } from '@trpc/client';
import { atom } from 'nanostores';
import { Peer } from 'peerjs';
import { useEffect, useRef, useState } from 'preact/hooks';
import type { FC } from 'react';
import SuperJSON from 'superjson';

const { PUBLIC_STREAM_WS_SERVER_URL } = import.meta.env;
console.log({ PUBLIC_STREAM_WS_SERVER_URL });
assert(PUBLIC_STREAM_WS_SERVER_URL, 'expected PUBLIC_STREAM_WS_SERVER_URL');

export default function Receiver() {
  // const [streamToken, setStreamToken] = useState<string | undefined>(undefined);
  const [streamToken$] = useState(atom<null | string>(null));
  const [token, setToken] = useState<null | string>(null);
  const [localPeerId] = useState(crypto.randomUUID());
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peer] = useState(new Peer(localPeerId));

  useEffect(() => {
    const context = cast.framework.CastReceiverContext.getInstance();
    context.addCustomMessageListener(
      'urn:x-cast:org.opengame.stream',
      (event) => {
        assert(
          'senderId' in event && typeof event.senderId === 'string',
          'expected senderId in event'
        );

        assert(
          'data' in event && typeof event.data === 'object',
          'expected data on event'
        );
        assert(
          'streamToken' in event.data &&
            typeof event.data.streamToken === 'string',
          'expected streamToken in payload'
        );
        streamToken$.set(event.data.streamToken);

        context.sendCustomMessage(
          'urn:x-cast:org.opengame.stream',
          event.senderId,
          JSON.stringify({ result: 'OK' })
        );
      }
    );

    const options = new cast.framework.CastReceiverOptions();
    options.disableIdleTimeout = true; //no timeout
    context.start(options);
  }, [setToken]);

  useEffect(() => {
    return streamToken$.subscribe(async (streamToken) => {
      if (!streamToken) {
        // todo shut off stream if one exists?
        return;
      }

      const wsClient = createWSClient({
        url: `${PUBLIC_STREAM_WS_SERVER_URL}?streamToken=${streamToken}&peerId=${localPeerId}`,
      });
      setToken(`${PUBLIC_STREAM_WS_SERVER_URL}?streamToken=${streamToken}`);

      await new Promise((resolve) => {
        peer.once('open', resolve);
      });

      const client = createTRPCProxyClient<StreamRouter>({
        links: [
          wsLink({
            client: wsClient,
          }),
        ],
        transformer: SuperJSON,
      });

      peer.once('call', (call) => {
        call.answer();
        call.once('stream', (remoteStream) => {
          setRemoteStream(remoteStream);
        });
      });

      client.run.subscribe(undefined, {
        onData(value) {
          // todo - do we need to handle updates?
        },
      });
    });
  }, [setRemoteStream, setToken]);

  return (
    <div style={{ background: 'red' }}>
      <h1 style={{ color: 'orange' }}>HI</h1>
      {token && <h1 style={{ color: 'orange' }}>{token}</h1>}
      {/* {!active && <button onClick={play}>Play</button>} */}
      {!remoteStream && <img src="/ogs_final.svg" alt="open game collective" />}
      {remoteStream && <RTCStream remoteStream={remoteStream} />}
    </div>
  );
}

const RTCStream: FC<{ remoteStream: MediaStream }> = ({ remoteStream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    assert(videoRef.current, 'expected videoRef');
    videoRef.current.srcObject = remoteStream;
    videoRef.current.play(); // todo does autoplay work?
  }, []);

  return (
    <>
      <video
        style={{
          position: 'absolute',
          inset: 0,
        }}
        playsInline
        ref={videoRef}
      />
    </>
  );
};
