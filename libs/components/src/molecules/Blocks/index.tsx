import { assertType } from '@explorers-club/utils';
import { MessageContentBlock, MessageEvent } from '@schema/types';
import { StrikersStartGameBlock } from '@strikers/client/components/ui/message-blocks/start-game-block';
import React, { useContext } from 'react';
import { BlockContext } from './block.context';

const PlainMessageBlock = () => {
  const { block } = useContext(BlockContext);
  assertType(block, 'PlainMessage');
  const { message } = block;

  return (
    // Replace with your component logic
    <div>{message}</div>
  );
};

const UserJoinedBlock = () => {
  const { block } = useContext(BlockContext);
  assertType(block, 'UserJoined');
  const { username, slug } = block;

  return (
    // Replace with your component logic
    <div>
      <strong>{username}</strong> joined {slug}
    </div>
  );
};

const PlayerConnectedBlock = () => {
  const { block } = useContext(BlockContext);
  assertType(block, 'PlayerConnected');
  const { username } = block;

  return (
    // Replace with your component logic
    <div>
      <strong>{username}</strong> connected
    </div>
  );
};

const PlayerDisconnectedBlock = () => {
  const { block } = useContext(BlockContext);
  assertType(block, 'PlayerDisconnected');
  const { username } = block;

  return (
    // Replace with your component logic
    <div>{username} disconnected</div>
  );
};

// Example of a polymorphic component that renders game specific components
const StartGameBlock = () => {
  const { block, message } = useContext(BlockContext);
  assertType(block, 'StartGame');

  switch (block.gameId) {
    case 'strikers':
      return <StrikersStartGameBlock />;
    default:
      throw new Error(
        'StartGameBlock not implemented for gameId' + block.gameId
      );
  }
};

// The component map
const componentMap = {
  PlainMessage: PlainMessageBlock,
  UserJoined: UserJoinedBlock,
  PlayerConnected: PlayerConnectedBlock,
  PlayerDisconnected: PlayerDisconnectedBlock,
  StartGame: StartGameBlock,
} as const;

export const MessageContent: React.FC<{
  block: MessageContentBlock;
  message: MessageEvent;
}> = ({ block, message }) => {
  const Component = componentMap[block.type];

  if (!Component) {
    console.warn(`No component found for block type "${block.type}"`);
    return null;
  }

  // Render the component, passing the block props as component props
  return (
    <BlockContext.Provider
      value={{
        block,
        message,
      }}
    >
      <Component />
    </BlockContext.Provider>
  );
};
