import { z } from 'zod';

// 1. Sync
const SyncInput = z.object({
  // Define the expected input fields and types here
});

// 2. Leave
const LeaveInput = z.object({
  peerId: z.string(),
});

// 3. JoinAsNewPeer
const JoinAsNewPeerInput = z.object({
  peerId: z.string(),
  rtpCapabilities: z.any(), // You can further specify this based on your needs
});

// 4. ConnectTransport
const ConnectTransportInput = z.object({
  peerId: z.string(),
  transportId: z.string(),
  dtlsParameters: z.any(), // You can further specify this based on your needs
});

// 5. SendTrack
const SendTrackInput = z.object({
  peerId: z.string(),
  transportId: z.string(),
  kind: z.string(),
  rtpParameters: z.any(),
  paused: z.boolean().optional(),
  appData: z.any(), // Further specify based on your needs
});

// 6. ReceiveTrack (Note: This was earlier named as 'recv-track' on the server)
const ReceiveTrackInput = z.object({
  peerId: z.string(),
  mediaPeerId: z.string(),
  mediaTag: z.string(),
  rtpCapabilities: z.any(),
});

// 7. CloseTransport
const CloseTransportInput = z.object({
  peerId: z.string(),
  transportId: z.string(),
});

// 8. CloseProducer
const CloseProducerInput = z.object({
  peerId: z.string(),
  producerId: z.string(),
});

// 9. PauseProducer
const PauseProducerInput = z.object({
  peerId: z.string(),
  producerId: z.string(),
});

// 10. ResumeProducer
const ResumeProducerInput = z.object({
  peerId: z.string(),
  producerId: z.string(),
});

// 11. CloseConsumer
const CloseConsumerInput = z.object({
  peerId: z.string(),
  consumerId: z.string(),
});

// 12. PauseConsumer
const PauseConsumerInput = z.object({
  peerId: z.string(),
  consumerId: z.string(),
});

// 13. ResumeConsumer
const ResumeConsumerInput = z.object({
  peerId: z.string(),
  consumerId: z.string(),
});

// 14. ConsumerSetLayers
const ConsumerSetLayersInput = z.object({
  peerId: z.string(),
  consumerId: z.string(),
  spatialLayer: z.number(),
});

// Now, you can use these zod schemas to validate your tRPC endpoints:

// Example for one of the signals:
/*
import { createRouter } from '@trpc/server';

const signalingRouter = createRouter()
  .mutation('sendTrack', {
    input: SendTrackInput,
    resolve: async ({ input }) => {
      // Your logic to handle the SendTrack signal
    },
  });
  // ... Add more mutations for other signals

export default signalingRouter;
*/

// Do this for each of the signals by creating the appropriate mutations.
