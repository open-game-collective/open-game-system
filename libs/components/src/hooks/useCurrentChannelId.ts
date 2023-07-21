import { WorldContext } from '@context/WorldProvider';
import { useContext } from 'react';
import { useEntityStoreSelector } from './useEntityStoreSelector';

export const useCurrentChannelId = () => {
  const { entityStoreRegistry } = useContext(WorldContext);
  const currentChannelId = useEntityStoreSelector(
    entityStoreRegistry.myConnectionEntity,
    (entity) => entity.currentChannelId
  );
  return currentChannelId;
};
