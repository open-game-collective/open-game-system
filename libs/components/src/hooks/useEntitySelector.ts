import { Entity } from '@explorers-club/schema';
import { useSyncExternalStore } from 'react';

export const useEntitySelector = <TEntity extends Entity, TResult>(
  entity: TEntity,
  selector: (entity: TEntity) => TResult
) => {
  let value = selector(entity) as TResult;

  const subscribe = (onStoreChange: () => void) => {
    const unsub = entity.subscribe((event) => {
      const nextValue = selector(entity) as TResult;
      if (value !== nextValue) {
        value = nextValue;
        onStoreChange();
      }
    });

    return () => {
      unsub();
    };
  };

  const getSnapshot = () => {
    return value;
  };

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot) as TResult;
};
