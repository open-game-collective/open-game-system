import { Box } from '@atoms/Box';
import { Button } from '@atoms/Button';
import { Text } from '@atoms/Text';
import { WorldContext } from '@context/WorldProvider';
import { assertEntitySchema, assertType } from '@explorers-club/utils';
import { useCreateEntityStore } from '@hooks/useCreateEntityStore';
import { useEntityIdSelector } from '@hooks/useEntityIdSelector';
import { useStore } from '@nanostores/react';
import {
  BlockCommand,
  ChannelEntity,
  MessageContentBlock,
  MessageEvent,
} from '@schema/types';
import { strikersMessageBlockMap } from '@strikers/client/components/ui/message-blocks';
import React, {
  MouseEventHandler,
  useCallback,
  useContext,
  useState,
} from 'react';
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

const MultipleChoiceBlock = () => {
  const { block, respond } = useContext(BlockContext);
  const [selectedValue, setSelectValue] = useState<string | null>(null);
  assertType(block, 'MultipleChoice');
  console.log(block.options);

  const handleClickSubmit = useCallback(() => {
    respond({
      type: 'MULTIPLE_CHOICE_CONFIRM',
    });
  }, [respond]);

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

      respond({
        type: 'MULTIPLE_CHOICE_SELECT',
        value: value,
      });
    },
    [setSelectValue]
  );

  return (
    <Box>
      <Text>{block.text}</Text>
      <ul style={{ listStyle: 'none' }}>
        {block.options.map(({ value, name }) => {
          console.log(block.options);
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

  const channelEntityStore = useCreateEntityStore<ChannelEntity>(
    (entity) => entity.id === message.channelId,
    [message.channelId]
  );

  const responderId = message.responderId || message.channelId;

  // warn: not safe
  const channelEntity = useStore(channelEntityStore);

  const respond = useCallback(
    (command: BlockCommand) => {
      const responderEntity = entitiesById.get(responderId);
      if (!responderEntity) {
        console.warn(
          'unexpected missing responderEntity when responding to message'
        );
      } else {
        responderEntity.send(command as any);
      }
    },
    [entitiesById, responderId]
  );

  if (!channelEntity) {
    return null;
  }

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
        respond,
      }}
    >
      <Component />
    </BlockContext.Provider>
  );
};
