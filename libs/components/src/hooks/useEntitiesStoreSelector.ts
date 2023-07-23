import { Entity } from '@explorers-club/schema';
import { Atom } from 'nanostores';
import { useSyncExternalStore } from 'react';
import { deepEqual } from '@explorers-club/utils';

type EqualityFn<T> = (a: T | undefined, b: T | undefined) => boolean;

const useEntitiesStoreSelectorBase = <TEntity extends Entity, TResult>(
  stores: Atom<TEntity | null>[],
  selector: (entities: TEntity[]) => TResult,
  equalityFn: EqualityFn<TResult>
) => {
  const initialEntities = stores.map(store => store.get()).filter(entity => entity !== null) as TEntity[];
  let values = initialEntities.length > 0 ? selector(initialEntities) : undefined;

  const subscribe = (onStoreChange: () => void) => {
    let unsubs: Function[] = [];

    const updateEntities = () => {
      const entities = stores.map(store => store.get()).filter(entity => entity !== null) as TEntity[];
      const nextValues = entities.length > 0 ? selector(entities) : undefined;

      if (!equalityFn(values, nextValues)) {
        values = nextValues;
        onStoreChange();
      }
    };

    stores.forEach((store, index) => {
      let unsub: Function | undefined;

      const entity = initialEntities[index];
      if (entity) {
        unsub = entity.subscribe(() => {
          updateEntities();
        });
      }

      const storeSub = store.listen((newEntity) => {
        if (unsub) {
          unsub();
          unsub = undefined;
        }

        if (newEntity) {
          unsub = newEntity.subscribe(() => {
            updateEntities();
          });
        }

        updateEntities();
      });

      unsubs.push(() => {
        if (unsub) {
          unsub();
        }
        storeSub();
      });
    });

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  };

  const getSnapshot = () => {
    return values;
  };

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};

export const useEntitiesStoreSelector = <TEntity extends Entity, TResult>(
  stores: Atom<TEntity | null>[],
  selector: (entities: TEntity[]) => TResult
) => {
  return useEntitiesStoreSelectorBase(stores, selector, (a, b) => {
    if (a === undefined || b === undefined) return a === b;
    return a === b;
  });
};

export const useEntitiesStoreSelectorDeepEqual = <TEntity extends Entity, TResult>(
  stores: Atom<TEntity | null>[],
  selector: (entities: TEntity[]) => TResult
) => {
  return useEntitiesStoreSelectorBase(stores, selector, (a, b) => {
    if (a === undefined || b === undefined) return a === b;
    return deepEqual(a, b);
  });
};
