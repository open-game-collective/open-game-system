import { transformer } from '@api/transformer';
import { assert } from '@explorers-club/utils';
import type { StreamRouter } from '@stream/router';
import { createTRPCProxyClient, createWSClient, wsLink } from '@trpc/client';
import type { Consumer } from 'mediasoup-client/lib/Consumer';
import { Peer } from 'peerjs';
import { useEffect, useRef, useState } from 'preact/hooks';
import type { FC } from 'react';

interface VideoElementWithConsumer extends HTMLVideoElement {
  consumer: Consumer;
}

export default function Receiver() {
  cast.framework.CastReceiverContext.getInstance().start();

  // const [active, setActive] = useState(false);
  const [streamId] = useState('foo');
  const [localPeerId] = useState(crypto.randomUUID());
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peer] = useState(new Peer(localPeerId));

  useEffect(() => {
    (async () => {
      const wsClient = createWSClient({
        url: `ws://localhost:3334?streamId=${streamId}`,
      });

      await new Promise((resolve) => {
        peer.once('open', resolve);
      });

      const client = createTRPCProxyClient<StreamRouter>({
        links: [
          wsLink({
            client: wsClient,
          }),
        ],
        transformer,
      });

      peer.once('call', (call) => {
        call.answer();
        call.once('stream', (remoteStream) => {
          setRemoteStream(remoteStream);
        });
      });

      client.run.subscribe(undefined, {
        onData(value) {
          // todo what does server send back to us here?
          console.log(value);
        },
      });

      // await client.run.mutate({ peerId: localPeerId, streamId });

      // Wait for the streamPeerId
      // client.peer.subscribe(
      //   { peerId: localPeerId },
      //   {
      //     onData({ id }) {
      //       peer.on('connection', (conn) => {
      //         conn.on('data', (data) => {
      //           // Will print 'hi!'
      //           console.log(data);
      //         });
      //         conn.on('open', () => {
      //           conn.send('hello!');
      //         });
      //       });
      //       peer.on('call', (call) => {
      //         // call
      //       });
      //       peer.connect(id);
      //     },
      //   }
      // );

      // const el = document.createElement<'video'>(
      //   'video'
      // ) as VideoElementWithConsumer;
      // const videoEl = videoRef.current;
      // assert(videoEl, 'expected ref to videoEl');

      // videoEl.srcObject = new MediaStream([videoConsumer.track.clone()]);
      // videoEl.consumer = videoConsumer;
      // console.log({ videoEl });
    })();
  }, [setRemoteStream]);

  return (
    <div style={{ background: 'red' }}>
      {/* {!active && <button onClick={play}>Play</button>} */}
      {!remoteStream && <img src="/ogs_final.svg" alt="open game collective" />}
      {remoteStream && <RemoteStream remoteStream={remoteStream} />}
    </div>
  );
}

const RemoteStream: FC<{ remoteStream: MediaStream }> = ({ remoteStream }) => {
  const videoRef = useRef<VideoElementWithConsumer>(null);

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

// todo get the streamId from chromecast somehow
// const context = cast.framework.CastReceiverContext.getInstance();

// context.addCustomMessageListener(
//     "urn:x-cast:org.firstlegoleague.castDeck",
//     event => {
//         var str = JSON.stringify(event);
//         shim.update(event.data);

//         // send something back
//         context.sendCustomMessage(
//             "urn:x-cast:org.firstlegoleague.castDeck",
//             event.senderId,
//             {
//                 requestId: event.data.requestId,
//                 data: shim.data,
//                 event,
//                 vp: shim.getViewport()
//             }
//         );
//     }
// );
