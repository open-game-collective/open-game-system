import { WorldContext } from '@context/WorldProvider';
import { Entity } from '@explorers-club/schema';
import type { Atom, atom } from 'nanostores';
import { useContext, useEffect, useRef, useState } from 'react';

export const useCreateEntityStore = <TEntity extends Entity>(
  query: (entity: Entity) => boolean,
  deps: React.DependencyList
) => {
  const { createEntityStore } = useContext(WorldContext);
  const initialized = useRef(false);
  // const a = create

  const [store, setStore] = useState(() => {
    return createEntityStore(query) as Atom<TEntity | null>;
  });

  useEffect(() => {
    // don't set the store to an new instance unless deps change after first run
    if (initialized.current) {
      setStore(createEntityStore(query));
    }
    initialized.current = true;
  }, deps);

  return store;
};
