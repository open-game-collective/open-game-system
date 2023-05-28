import { Heading } from '@atoms/Heading';
import { InitializedConnectionEntityContext } from '../../context/Entity';
import { enablePatches } from 'immer';
import { useContext } from 'react';
import { Flex } from '@atoms/Flex';
import { RoomContext } from './room.context';
enablePatches();

export const Room = () => {
  const { roomEntity, connectionEntity } = useContext(RoomContext);

  return (
    <Flex gap="2" css={{ p: '$3' }}>
      <Heading size="1">
        {roomEntity.slug} {connectionEntity.currentRoomSlug}
      </Heading>
    </Flex>
  );
};
