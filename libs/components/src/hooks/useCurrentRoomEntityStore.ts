import type { RoomEntity } from '@explorers-club/schema';
import { useCreateEntityStore } from '@hooks/useCreateEntityStore';
import { useEntityStoreSelector } from '@hooks/useEntityStoreSelector';
import { myInitializedConnectionEntityStore } from '@state/world';

export const useCurrentRoomEntityStore = () => {
  const currentRoomSlug = useEntityStoreSelector(
    myInitializedConnectionEntityStore,
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
