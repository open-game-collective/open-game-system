import { assertEntitySchema, assertType } from '@explorers-club/utils';
import {
  ChannelEntity,
  MessageContentBlock,
  MessageEvent,
} from '@schema/types';
import React, {
  MouseEventHandler,
  useCallback,
  useContext,
  useState,
} from 'react';
import { BlockContext } from './block.context';
import { useEntityIdSelector } from '@hooks/useEntityIdSelector';
import { WorldContext, WorldProvider } from '@context/WorldProvider';
import { strikersMessageBlockMap } from '@strikers/client/components/ui/message-blocks';
import { GameId } from '@schema/literals';
import { ConnectionContext } from '@context/ApplicationProvider';
import { useConnectionEntity } from '@hooks/useConnectionEntity';
import { Box } from '@atoms/Box';
import { Text } from '@atoms/Text';
import { Button } from '@atoms/Button';

const PlainMessageBlock = () => {
  const { block } = useContext(BlockContext);
  assertType(block, 'PlainMessage');
  const { message } = block;

  return (
    // Replace with your component logic
    <div>{message}</div>
  );
};

const MultipleChoiceBlock = () => {
  const { block, channelEntity } = useContext(BlockContext);
  const [selectedValue, setSelectValue] = useState<string | null>(null);
  assertType(block, 'MultipleChoice');

  const handleClickSubmit = useCallback(() => {
    channelEntity.send({
      type: 'MULTIPLE_CHOICE_CONFIRM',
    });
  }, [channelEntity]);

  const handleClickOption: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      const value = event.currentTarget.getAttribute('data-value');
      if (!value) {
        return console.warn(
          'expected data-value for click on ',
          event.currentTarget
        );
      }
      setSelectValue(value);

      channelEntity.send({
        type: 'MULTIPLE_CHOICE_SELECT',
        value: value,
      });
    },
    [channelEntity, setSelectValue]
  );

  return (
    <Box>
      <Text>{block.text}</Text>
      <ul style={{ listStyle: 'none' }}>
        {block.options.map(({ value, name }) => {
          return (
            <Button
              key={value}
              css={{
                border: value === selectedValue ? '2px solid blue' : 'none',
              }}
              data-value={value}
              onClick={handleClickOption}
            >
              {name}
            </Button>
          );
        })}
      </ul>
      {selectedValue && <Button onClick={handleClickSubmit}>Submit</Button>}
    </Box>
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
  MultipleChoice: MultipleChoiceBlock,
} as const;

// todo swap gameId based off message channel
// const gameMessageBlockMap = {
//   strikers: strikersMessageBlockMap,
//   little_vigilante: {},
//   codebreakers: {},
//   banana_traders: {},
// } as const;

export const MessageContent: React.FC<{
  block: MessageContentBlock;
  message: MessageEvent;
}> = ({ block, message }) => {
  const allBlocks = {
    ...strikersMessageBlockMap,
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
