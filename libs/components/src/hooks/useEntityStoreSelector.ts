import { Entity } from '@explorers-club/schema';
import { Atom } from 'nanostores';
import { useSyncExternalStore } from 'react';
import { deepEqual } from '@explorers-club/utils';

type EqualityFn<T> = (a: T | undefined, b: T | undefined) => boolean;

const useEntityStoreSelectorBase = <TEntity extends Entity, TResult>(
  store: Atom<TEntity | null>,
  selector: (entity: TEntity) => TResult,
  equalityFn: EqualityFn<TResult>
) => {
  const initialEntity = store.get();
  let value = initialEntity ? selector(initialEntity) : undefined;

  const subscribe = (onStoreChange: () => void) => {
    let unsub: Function | undefined;

    if (initialEntity) {
      unsub = initialEntity.subscribe(() => {
        const nextValue = selector(initialEntity);

        if (!equalityFn(value, nextValue)) {
          value = nextValue;
          onStoreChange();
        }
      });
    }

    return store.listen((entity) => {
      if (unsub) {
        unsub();
        unsub = undefined;
      }

      if (!entity) {
        value = undefined;
        onStoreChange();
        return;
      }

      unsub = entity.subscribe(() => {
        const nextValue = selector(entity);

        if (!equalityFn(value, nextValue)) {
          value = nextValue;
          onStoreChange();
        }
      });

      const nextValue = selector(entity);
      if (!equalityFn(value, nextValue)) {
        value = nextValue;
        onStoreChange();
      }
    });
  };

  const getSnapshot = () => {
    return value;
  };

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};

export const useEntityStoreSelector = <TEntity extends Entity, TResult>(
  store: Atom<TEntity | null>,
  selector: (entity: TEntity) => TResult
) => {
  return useEntityStoreSelectorBase(store, selector, (a, b) => {
    if (a === undefined || b === undefined) return a === b;
    return a === b;
  });
};

export const useEntityStoreSelectorDeepEqual = <
  TEntity extends Entity,
  TResult
>(
  store: Atom<TEntity | null>,
  selector: (entity: TEntity) => TResult
) => {
  return useEntityStoreSelectorBase(store, selector, (a, b) => {
    if (a === undefined || b === undefined) return a === b;
    return deepEqual(a, b);
  });
};
