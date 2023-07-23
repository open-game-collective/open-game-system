import { assertEntitySchema, assertType } from '@explorers-club/utils';
import {
  ChannelEntity,
  MessageContentBlock,
  MessageEvent,
} from '@schema/types';
import { StrikersStartGameBlock } from '@strikers/client/components/ui/message-blocks/start-game-block';
import React, { useContext } from 'react';
import { BlockContext } from './block.context';
import { useEntityIdSelector } from '@hooks/useEntityIdSelector';
import { WorldContext, WorldProvider } from '@context/WorldProvider';

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
  const { userId, slug } = block;

  const name = useEntityIdSelector(userId, (entity) => {
    assertEntitySchema(entity, 'user');
    return entity.name || `Player ${entity.serialNumber}`;
  });

  return (
    // Replace with your component logic
    <div>
      <strong>{name}</strong> joined {slug}
    </div>
  );
};

const UserConnectedBlock = () => {
  const { block } = useContext(BlockContext);
  assertType(block, 'UserConnected');
  const { userId } = block;

  return (
    // Replace with your component logic
    <div>
      <strong>{userId}</strong> connected
    </div>
  );
};

const UserDisconnectedBlock = () => {
  const { block } = useContext(BlockContext);
  assertType(block, 'UserDisconnected');
  const { userId } = block;

  return (
    // Replace with your component logic
    <div>{userId} disconnected</div>
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

const TurnStartedBlock = () => {
  const { block } = useContext(BlockContext);
  assertType(block, 'TurnStarted');

  return (
    // Replace with your component logic
    <div>{block.turnId} started turn</div>
  );
};

// The component map
const componentMap = {
  PlainMessage: PlainMessageBlock,
  UserJoined: UserJoinedBlock,
  UserConnected: UserConnectedBlock,
  UserDisconnected: UserDisconnectedBlock,
  StartGame: StartGameBlock,
  TurnStarted: TurnStartedBlock,
} as const;

export const MessageContent: React.FC<{
  block: MessageContentBlock;
  message: MessageEvent;
}> = ({ block, message }) => {
  const Component = componentMap[block.type];
  const { entitiesById } = useContext(WorldContext);
  // warn: not safe
  const channelEntity = entitiesById.get(message.channelId) as ChannelEntity;

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
        channelEntity,
      }}
    >
      <Component />
    </BlockContext.Provider>
  );
};
