import { Box } from '@atoms/Box';
import { Flex } from '@atoms/Flex';
import { Heading } from '@atoms/Heading';
import { InitializedConnectionEntityContext } from '@context/Entity';
import { useStore } from '@nanostores/react';
import { NewRoomFlow } from '@organisms/new-room-flow';
import { Room } from '@organisms/room';
import { useCreateEntityStore } from '@hooks/useCreateEntityStore';
import { ButtonLink } from '@atoms/Button';
import { MouseEventHandler, useCallback, useContext } from 'react';
import { RoomContext } from '@organisms/room/room.context';
import { useEntitySelector } from '@hooks/useEntitySelector';
import { useEntityStoreSelector } from '@hooks/useEntityStoreSelector';
import type { RoomEntity } from '@explorers-club/schema';
import { ApplicationContext } from '@context/ApplicationContext';
import { WorldContext } from '@context/WorldProvider';

export const MainPanel = () => {
  const { routeStore } = useContext(ApplicationContext);
  const currentRoute = useStore(routeStore);

  return (
    <Box css={{ p: '$3', background: 'black' }}>
      {currentRoute.name === 'Home' && <HomePanel />}
      {currentRoute.name === 'NewRoom' && <NewRoomPanel />}
      {currentRoute.name === 'Login' && <LoginPanel />}
      {currentRoute.name === 'Room' && <RoomPanel />}
    </Box>
  );
};

const HomePanel = () => {
  const { entityStoreRegistry } = useContext(WorldContext);

  const handleCreateRoom: MouseEventHandler<HTMLAnchorElement> = useCallback(
    (event) => {
      const entity = entityStoreRegistry.myInitializedConnectionEntity.get();
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
  const { entityStoreRegistry } = useContext(WorldContext);
  const entity = useStore(entityStoreRegistry.myInitializedConnectionEntity);
  return entity ? (
    <InitializedConnectionEntityContext.Provider value={entity}>
      <NewRoomFlow />
    </InitializedConnectionEntityContext.Provider>
  ) : null;
};

const RoomPanel = () => {
  const { entityStoreRegistry } = useContext(WorldContext);
  const connectionEntity = useStore(
    entityStoreRegistry.myInitializedConnectionEntity
  );
  const currentRoomSlug = useEntityStoreSelector(
    entityStoreRegistry.myInitializedConnectionEntity,
    (entity) => entity.currentRoomSlug
  );
  console.log({ connectionEntity, currentRoomSlug });
  const roomEntityStore = useCreateEntityStore<RoomEntity>(
    (entity) => {
      return (currentRoomSlug &&
        entity.schema === 'room' &&
        entity.slug === currentRoomSlug) as boolean;
    },
    [currentRoomSlug]
  );

  const roomEntity = useStore(roomEntityStore);
  // console.log({
  //   roomEntity,
  //   connectionEntity,
  //   currentRoomSlug,
  //   roomEntityStore,
  //   init: entityStoreRegistry.myInitializedConnectionEntity,
  // });

  if (!roomEntity || !connectionEntity) {
    return <div>loading entities</div>;
  }

  return (
    <RoomContext.Provider value={{ connectionEntity, roomEntity }}>
      <Room />
    </RoomContext.Provider>
  );
};
