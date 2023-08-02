import { WorldContext } from '@context/WorldProvider';
import { useStore } from '@nanostores/react';
import { useContext } from 'react';

export const useConnectionEntity = () => {
  const { entityStoreRegistry } = useContext(WorldContext);
  return useStore(entityStoreRegistry.myConnectionEntity);
};
