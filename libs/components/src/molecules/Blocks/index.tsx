import { assertEntitySchema, assertType } from '@explorers-club/utils';
import {
  ChannelEntity,
  MessageContentBlock,
  MessageEvent,
} from '@schema/types';
import React, { useContext } from 'react';
import { BlockContext } from './block.context';
import { useEntityIdSelector } from '@hooks/useEntityIdSelector';
import { WorldContext, WorldProvider } from '@context/WorldProvider';
import { strikersMessageBlockMap } from '@strikers/client/components/ui/message-blocks';
import { GameId } from '@schema/literals';

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

const commonMessageBlockMap = {
  PlainMessage: PlainMessageBlock,
  UserJoined: UserJoinedBlock,
  UserConnected: UserConnectedBlock,
  UserDisconnected: UserDisconnectedBlock,
} as const;

const gameMessageBlockMap = {
  strikers: strikersMessageBlockMap,
  little_vigilante: {},
  codebreakers: {},
  banana_traders: {},
} as const;

export const MessageContent: React.FC<{
  block: MessageContentBlock;
  message: MessageEvent;
}> = ({ block, message }) => {
  const gameMessageBlocks =
    'gameId' in block ? gameMessageBlockMap[block.gameId] : {};
  const allBlocks = {
    ...gameMessageBlocks,
    ...commonMessageBlockMap,
  } as const;

  // ts hack to get around not having game-specfici type info in allBlocks
  const Component = allBlocks[block.type as unknown as keyof typeof allBlocks]; 
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
