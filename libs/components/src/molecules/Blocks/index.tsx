import {
  MessageContentBlockSchema,
  PlainMessageBlockSchema,
  PlayerConnectedBlockSchema,
  PlayerDisconnectedBlockSchema,
  StartGameBlockSchema,
  UserJoinedBlockSchema,
} from '@schema/lib/room';
import React from 'react';
import { z } from 'zod';

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
  slug,
}) => (
  // Replace with your component logic
  <div>
    <strong>{username}</strong> joined {slug}
  </div>
);

const PlayerConnectedBlock: React.FC<
  z.infer<typeof PlayerConnectedBlockSchema>
> = ({ playerId, username, timestamp }) => (
  // Replace with your component logic
  <div>
    <strong>{username}</strong> connected
  </div>
);

const PlayerDisconnectedBlock: React.FC<
  z.infer<typeof PlayerDisconnectedBlockSchema>
> = ({ playerId, username, timestamp }) => (
  // Replace with your component logic
  <div>{username} disconnected</div>
);

const StartGameBlock: React.FC<z.infer<typeof StartGameBlockSchema>> = ({
  gameId,
  timestamp,
}) => (
  // Replace with your component logic
  <div>start game when two players are here.</div>
);

// The component map
const componentMap = {
  PlainMessage: PlainMessageBlock,
  UserJoined: UserJoinedBlock,
  PlayerConnected: PlayerConnectedBlock,
  PlayerDisconnected: PlayerDisconnectedBlock,
  StartGame: StartGameBlock,
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
