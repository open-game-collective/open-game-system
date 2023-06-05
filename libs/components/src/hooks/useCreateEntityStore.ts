import { WorldContext } from '@context/WorldProvider';
import { Entity } from '@explorers-club/schema';
import { atom } from 'nanostores';
import { useContext, useEffect, useState } from 'react';

export const useCreateEntityStore = <TEntity extends Entity>(
  query: (entity: Entity) => boolean,
  deps: React.DependencyList
) => {
  const { createEntityStore } = useContext(WorldContext);
  // const a = create

  const [store, setStore] = useState(atom<TEntity | null>(null));
  useEffect(() => {
    setStore(createEntityStore(query));
  }, deps);

  return store;
};
