import { Heading } from '@atoms/Heading';
import { InitializedConnectionEntityContext } from '../../context/Entity';
import { enablePatches } from 'immer';
import { FC, useCallback, useContext } from 'react';
import { Flex } from '@atoms/Flex';
import { Text } from '@atoms/Text';
import { RoomContext } from './room.context';
import { useEntitySelector } from '@hooks/useEntitySelector';
import { Box } from '@atoms/Box';
import { Button } from '@atoms/Button';
import { RoomEntity, SnowflakeId } from '@schema/types';
enablePatches();

export const Room = () => {
  const { roomEntity } = useContext(RoomContext);
  const connectPlayerCount = useEntitySelector(
    roomEntity,
    (entity) => entity.allSessionIds.length
  );
  const currentGameInstanceId = useEntitySelector(
    roomEntity,
    (entity) => entity.currentGameInstanceId
  );

  const selectedGameId = useEntitySelector(roomEntity, (state) => state.gameId);

  return !!currentGameInstanceId ? (
    <GameInstancePanel gameInstanceId={currentGameInstanceId} />
  ) : (
    <Flex gap="2" css={{ p: '$2', gap: '$2' }} direction="column">
      <Heading size="2">#{roomEntity.slug}</Heading>
      <Heading>{roomEntity.gameId}</Heading>
      <Text>{connectPlayerCount} connected</Text>
      {selectedGameId ? <GameConfigPanel /> : <SelectGamePanel />}
    </Flex>
  );
};

const GameInstancePanel: FC<{ gameInstanceId: SnowflakeId }> = ({
  gameInstanceId,
}) => {
  return <div>Welcome to {gameInstanceId}</div>;
};

const GameConfigPanel = () => {
  const { roomEntity } = useContext(RoomContext);
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
      <div>Game {selectedGameId}</div>
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
