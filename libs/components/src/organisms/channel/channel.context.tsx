import { WorldContext } from '@context/WorldProvider';
import {
  ConnectionEntity,
  RoomEntity,
  SessionEntity,
} from '@explorers-club/schema';
import { useCreateEntityStore } from '@hooks/useCreateEntityStore';
import { useEntityStoreSelector } from '@hooks/useEntityStoreSelector';
import { useStore } from '@nanostores/react';
import { FC, ReactNode, createContext, useContext } from 'react';

export const ChannelContext = createContext(
  {} as {
    connectionEntity: ConnectionEntity;
    roomEntity: RoomEntity;
    sessionEntity: SessionEntity;
  }
);

export const ChannelProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { entityStoreRegistry } = useContext(WorldContext);
  const connectionEntity = useStore(entityStoreRegistry.myConnectionEntity);
  const sessionEntity = useStore(entityStoreRegistry.mySessionEntity);
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

  if (!roomEntity || !connectionEntity || !sessionEntity) {
    // todo loading component injected
    return <></>;
  }

  return (
    <ChannelContext.Provider
      value={{ connectionEntity, roomEntity, sessionEntity }}
    >
      {children}
    </ChannelContext.Provider>
  );
};
