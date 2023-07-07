import { WorldContext } from '@context/WorldProvider';
import type { RoomEntity } from '@explorers-club/schema';
import { useCreateEntityStore } from '@hooks/useCreateEntityStore';
import { useEntityStoreSelector } from '@hooks/useEntityStoreSelector';
import { useContext } from 'react';

export const useCurrentChannelEntityStore = () => {
  const { entityStoreRegistry } = useContext(WorldContext);
  const currentChannelId = useEntityStoreSelector(
    entityStoreRegistry.myInitializedConnectionEntity,
    (entity) => entity.currentChannelId
  );
  // console.log('CURRENT CHANNEL', { currentChannelId });

  return useCreateEntityStore<RoomEntity>(
    (entity) => {
      // console.log(
      //   'checking channel query',
      //   entity.schema,
      //   entity.id,
      //   currentChannelId
      // );
      return (currentChannelId &&
        entity.schema === 'room' &&
        entity.id === currentChannelId) as boolean;
    },
    [currentChannelId]
  );
};
