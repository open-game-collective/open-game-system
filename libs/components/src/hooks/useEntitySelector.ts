import { Entity, SnowflakeId } from '@explorers-club/schema';
import { entitiesByIdStore } from '../state/world';
import { useStore } from '@nanostores/react';
import { useSyncExternalStore } from 'react';

export const useEntitySelector = <T extends Entity, R = ReturnType<(arg: T) => any>>(
  id: SnowflakeId,
  selector: (state: T) => R
): R => {
  const entitiesById = useStore(entitiesByIdStore);
  const entity = entitiesById.get(id) as T | undefined;
  if (!entity) {
    throw new Error('entity missing: ' + entity);
  }
  let value = selector(entity) as R;
  const getSnapshot = () => {
    return value;
  };

  const subscribe = (onStoreChange: () => void) => {
    const unsub = entity.subscribe((event) => {
      const nextValue = selector(entity) as R;
      if (value !== nextValue) {
        value = nextValue;
        onStoreChange();
      }
    });

    return () => {
      unsub();
    };
  };

  return useSyncExternalStore(subscribe, getSnapshot) as R;
};
