import { WorldContext } from '@context/WorldProvider';
import { ConnectionEntity, RoomEntity } from '@explorers-club/schema';
import { useCreateEntityStore } from '@hooks/useCreateEntityStore';
import { useEntityStoreSelector } from '@hooks/useEntityStoreSelector';
import { useStore } from '@nanostores/react';
import { FC, ReactNode, createContext, useContext } from 'react';

export const RoomContext = createContext(
  {} as {
    connectionEntity: ConnectionEntity;
    roomEntity: RoomEntity;
  }
);

export const RoomProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { entityStoreRegistry } = useContext(WorldContext);
  const connectionEntity = useStore(
    entityStoreRegistry.myConnectionEntity
  );
  const currentChannelId = useEntityStoreSelector(
    entityStoreRegistry.myConnectionEntity,
    (entity) => entity.currentChannelId
  );

  const roomEntityStore = useCreateEntityStore<RoomEntity>(
    (entity) => {
      return (currentChannelId && entity.id === currentChannelId) as boolean;
    },
    [currentChannelId]
  );

  const roomEntity = useStore(roomEntityStore);

  if (!roomEntity || !connectionEntity) {
    // todo loading component injected
    return <></>;
  }

  return (
    <RoomContext.Provider value={{ connectionEntity, roomEntity }}>
      {children}
    </RoomContext.Provider>
  );
};
