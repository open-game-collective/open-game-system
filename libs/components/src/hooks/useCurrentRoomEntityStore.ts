import { WorldContext } from '@context/WorldProvider';
import type { RoomEntity } from '@explorers-club/schema';
import { useCreateEntityStore } from '@hooks/useCreateEntityStore';
import { useEntityStoreSelector } from '@hooks/useEntityStoreSelector';
import { useContext } from 'react';

export const useCurrentRoomEntityStore = () => {
  const { entityStoreRegistry } = useContext(WorldContext);
  const currentRoomSlug = useEntityStoreSelector(
    entityStoreRegistry.myInitializedConnectionEntity,
    (entity) => entity.currentRoomSlug
  );

  return useCreateEntityStore<RoomEntity>(
    (entity) => {
      return (currentRoomSlug &&
        entity.schema === 'room' &&
        entity.slug === currentRoomSlug) as boolean;
    },
    [currentRoomSlug]
  );
};
