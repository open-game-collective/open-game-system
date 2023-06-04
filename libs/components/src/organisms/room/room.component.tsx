import { Heading } from '@atoms/Heading';
import { InitializedConnectionEntityContext } from '../../context/Entity';
import { enablePatches } from 'immer';
import { useContext } from 'react';
import { Flex } from '@atoms/Flex';
import { Text } from '@atoms/Text';
import { RoomContext } from './room.context';
import { useEntitySelector } from '@hooks/useEntitySelector';
enablePatches();

export const Room = () => {
  const { roomEntity } = useContext(RoomContext);
  const connectPlayerCount = useEntitySelector(
    roomEntity,
    (entity) => entity.connectedEntityIds.length
  );

  const selectedGameId = useEntitySelector(roomEntity, (state) => state.gameId);

  return (
    <Flex gap="2" css={{ p: '$2', gap: '$2' }} direction="column">
      <Heading size="2">#{roomEntity.slug}</Heading>
      <Heading>{roomEntity.gameId}</Heading>
      <Text>{connectPlayerCount} connected</Text>
      <Text>{selectedGameId ? selectedGameId : 'No game selected'}</Text>
    </Flex>
  );
};
