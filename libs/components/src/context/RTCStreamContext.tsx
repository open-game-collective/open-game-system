// /// <reference types="chrome"/>
// import { StreamRouter } from '@stream/client';
// import { createTRPCProxyClient, createWSClient, wsLink } from '@trpc/client';
// import { listenKeys, map } from 'nanostores';
// import { Peer } from 'peerjs';
// import { FC, createContext, useEffect, useState } from 'react';
// import superjson from 'superjson';

// const rtcStream$ = map({
//   streamId: '',
// });

// export const RTCStreamContext = createContext(rtcStream$);

// export const RTCStreamProvider: FC<{
//   streamServerUrl: string;
//   store?: typeof rtcStream$;
// }> = ({ streamServerUrl, store }) => {
//   const [peer] = useState(new Peer());
//   const streamId = 'foo'; // todo parse from serverurl

//   const wsClient = createWSClient({
//     url: streamServerUrl,
//   });

//   const client = createTRPCProxyClient<StreamRouter>({
//     links: [
//       wsLink({
//         client: wsClient,
//       }),
//     ],
//     transformer: superjson,
//   });

//   const [rtcStream$] = useState(
//     store ||
//       map({
//         streamId, //todo parse from url
//       })
//   );

//   useEffect(() => {
//     peer.once('open', (id) => {
//       (async () => {
//         const stream = await new Promise((resolve, reject) => {

//           // can't call this directly... need to

//           // chrome.tabCapture.capture({ video: true, audio: true }, (stream) => {
//           //   if (stream) resolve(stream);
//           //   else reject();
//           // });
//         });
//         console.log('GOT STREAM!', { stream });
//       })();

//       //   client.peers.subscribe(
//       //     { streamId },
//       //     {
//       //       onData({ peerId }) {
//       //         peer.call(peerId, stream);
//       //         // peer.on('connection', (conn) => {
//       //         //   conn.on('data', (data) => {
//       //         //     // Will print 'hi!'
//       //         //     console.log(data);
//       //         //   });
//       //         //   conn.on('open', () => {
//       //         //     conn.send('hello!');
//       //         //   });
//       //         // });
//       //         // peer.on('call', (call) => {
//       //         //   // call
//       //         // });
//       //         // peer.connect(id);
//       //       },
//       //     }
//       //   );
//     });

//     listenKeys(rtcStream$, ['localPeerId'], (value) => {
//       value.localPeerId;
//     });
//   }, [peer, rtcStream$, client]);

//   console.log({ streamServerUrl });
//   return <RTCStreamContext.Provider value={rtcStream$} />;
// };
