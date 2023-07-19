import React from 'react';
import { z } from 'zod';
import {
  PlainMessageBlockSchema,
  UserJoinedBlockSchema,
  PlayerConnectedBlockSchema,
  PlayerDisconnectedBlockSchema,
  MessageContentBlockSchema,
} from '@schema/blocks';

// Define React components using inferred Zod schema types

const PlainMessageBlock: React.FC<z.infer<typeof PlainMessageBlockSchema>> = ({
  avatarId,
  message,
  timestamp,
  textSize,
  textColor,
}) => (
  // Replace with your component logic
  <div>{message}</div>
);

const UserJoinedBlock: React.FC<z.infer<typeof UserJoinedBlockSchema>> = ({
  avatarId,
  username,
  timestamp,
}) => (
  // Replace with your component logic
  <div>{username} joined</div>
);

const PlayerConnectedBlock: React.FC<
  z.infer<typeof PlayerConnectedBlockSchema>
> = ({ playerId, username, timestamp }) => (
  // Replace with your component logic
  <div>{username} connected</div>
);

const PlayerDisconnectedBlock: React.FC<
  z.infer<typeof PlayerDisconnectedBlockSchema>
> = ({ playerId, username, timestamp }) => (
  // Replace with your component logic
  <div>{username} disconnected</div>
);

// The component map
const componentMap = {
  PlainMessage: PlainMessageBlock,
  UserJoined: UserJoinedBlock,
  PlayerConnected: PlayerConnectedBlock,
  PlayerDisconnected: PlayerDisconnectedBlock,
} as const;

export const MessageContentBlock: React.FC<{
  block: z.infer<typeof MessageContentBlockSchema>;
}> = ({ block }) => {
  const Component = componentMap[block.type];

  if (!Component) {
    console.warn(`No component found for block type "${block.type}"`);
    return null;
  }

  // Render the component, passing the block props as component props
  return <Component {...(block as any)} />;
};
