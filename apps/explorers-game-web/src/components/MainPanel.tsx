import { Box } from '@atoms/Box';
import { Flex } from '@atoms/Flex';
import { Heading } from '@atoms/Heading';
import { InitializedConnectionEntityContext } from '@context/Entity';
import { useStore } from '@nanostores/react';
import { NewRoomFlow } from '@organisms/new-room-flow';
import { Room } from '@organisms/room';
import { myInitializedConnectionEntityStore } from '@state/world';
import { useCreateEntityStore } from '@hooks/useCreateEntityStore';
import { currentRouteStore } from '../state/navigation';
import { ButtonLink } from '@atoms/Button';
import { MouseEventHandler, useCallback } from 'react';
import { RoomContext } from '@organisms/room/room.context';
import {
  useEntitySelector,
  useEntityStoreSelector,
} from '@hooks/useEntitySelector';
import type { RoomEntity } from '@explorers-club/schema';

export const MainPanel = () => {
  const currentRoute = useStore(currentRouteStore);

  return (
    <Box css={{ p: '$3' }}>
      {currentRoute === 'Home' && <HomePanel />}
      {currentRoute === 'NewRoom' && <NewRoomPanel />}
      {currentRoute === 'Login' && <LoginPanel />}
      {currentRoute === 'Room' && <RoomPanel />}
    </Box>
  );
};

const HomePanel = () => {
  const handleCreateRoom: MouseEventHandler<HTMLAnchorElement> = useCallback(
    (event) => {
      const entity = myInitializedConnectionEntityStore.get();
      if (entity) {
        event.preventDefault();
        entity.send({
          type: 'NAVIGATE',
          route: { name: 'NewRoom' },
        });
      }
    },
    []
  );

  return (
    <Flex direction="column" gap="2">
      <Heading>Home</Heading>
      <ButtonLink href="/new" onClick={handleCreateRoom}>
        Create Room
      </ButtonLink>
    </Flex>
  );
};

const LoginPanel = () => {
  return <div>Login</div>;
};

const NewRoomPanel = () => {
  const entity = useStore(myInitializedConnectionEntityStore);
  return entity ? (
    <InitializedConnectionEntityContext.Provider value={entity}>
      <NewRoomFlow />
    </InitializedConnectionEntityContext.Provider>
  ) : null;
};

const RoomPanel = () => {
  const currentRoomSlug = useEntityStoreSelector(
    myInitializedConnectionEntityStore,
    (entity) => entity.currentRoomSlug
  );
  const roomEntityStore = useCreateEntityStore<RoomEntity>(
    (entity) => {
      return (
        currentRoomSlug &&
        entity.schema === 'room' &&
        entity.slug === currentRoomSlug
      );
    },
    [currentRoomSlug]
  );

  const roomEntity = useStore(roomEntityStore);
  const connectionEntity = useStore(myInitializedConnectionEntityStore);

  if (!roomEntity || !connectionEntity) {
    return <div>loading entities</div>;
  }

  return (
    <RoomContext.Provider value={{ connectionEntity, roomEntity }}>
      <Room />
    </RoomContext.Provider>
  );
};
