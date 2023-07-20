import { Heading } from '@atoms/Heading';
import { InitializedConnectionEntityContext } from '../../context/Entity';
import { enablePatches } from 'immer';
import { FC, useCallback, useContext } from 'react';
import { Flex } from '@atoms/Flex';
import { Text } from '@atoms/Text';
import { ChannelContext } from './channel.context';
import { useEntitySelector } from '@hooks/useEntitySelector';
import { Box } from '@atoms/Box';
import { Button } from '@atoms/Button';
import { RoomEntity, SnowflakeId } from '@schema/types';
import { IconButton } from '@atoms/IconButton';
import { ChevronDownIcon, FrameIcon, SizeIcon } from '@radix-ui/react-icons';
enablePatches();

export const Channel = () => {
  const { roomEntity } = useContext(ChannelContext);
  const connectedCount = useEntitySelector(
    roomEntity,
    (entity) => entity.allSessionIds.length
  );
  const currentGameInstanceId = useEntitySelector(
    roomEntity,
    (entity) => entity.currentGameInstanceId
  );

  const selectedGameId = useEntitySelector(roomEntity, (state) => state.gameId);
  return (
    <Flex
      css={{ px: '$2', background: '#eee' }}
      direction="row"
      gap="2"
      align="center"
      justify="between"
    >
      <IconButton css={{ backgroundColor: 'white' }} variant="stroke" size="3">
        <FrameIcon />
      </IconButton>
      <Flex
        gap="1"
        css={{ p: '$2', background: 'rgba(0,0,0,.05)', flex: '1' }}
        direction="column"
      >
        <Heading size="1">#{roomEntity.slug}</Heading>
        <Text>{connectedCount} connected</Text>
        {/* {selectedGameId ? <GameConfigPanel /> : <SelectGamePanel />} */}
      </Flex>
      <Flex>
        <IconButton size="1">
          <ChevronDownIcon />
        </IconButton>
        <IconButton size="1">
          <SizeIcon />
        </IconButton>
      </Flex>
    </Flex>
  );
};

const GameInstancePanel: FC<{ gameInstanceId: SnowflakeId }> = ({
  gameInstanceId,
}) => {
  return <div>Welcome to {gameInstanceId}</div>;
};

const GameConfigPanel = () => {
  const { roomEntity } = useContext(ChannelContext);
  const selectedGameId = useEntitySelector(roomEntity, (state) => state.gameId);
  const numPlayers = useEntitySelector(
    roomEntity,
    (state) => state.allSessionIds.length
  );

  const handlePressStart = useCallback(() => {
    roomEntity.send({
      type: 'START',
    });
  }, [roomEntity]);

  return (
    <Box>
      <Button disabled={numPlayers !== 2} onClick={handlePressStart}>
        Start
      </Button>
    </Box>
  );
};

const SelectGamePanel = () => {
  return (
    <Box>
      <Text>Choose a game</Text>
    </Box>
  );
};
