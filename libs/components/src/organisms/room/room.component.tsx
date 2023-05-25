import { Heading } from '@atoms/Heading';
import { InitializedConnectionEntityContext } from '../../context/Entity';
import { enablePatches } from 'immer';
import { useContext } from 'react';
import { Flex } from '@atoms/Flex';
enablePatches();

export const Room = () => {
  const connectionEntity = useContext(InitializedConnectionEntityContext);

  return (
    <Flex gap="2" css={{ p: '$3' }}>
      <Heading size="1">#{connectionEntity.currentRoomSlug}</Heading>
    </Flex>
  );
};
