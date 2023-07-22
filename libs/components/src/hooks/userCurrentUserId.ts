import { WorldContext } from '@context/WorldProvider';
import { useContext } from 'react';
import { useEntityStoreSelector } from './useEntityStoreSelector';

export const useMyUserId = () => {
  const { entityStoreRegistry } = useContext(WorldContext);
  return useEntityStoreSelector(
    entityStoreRegistry.mySessionEntity,
    (entity) => entity.userId
  );
};
