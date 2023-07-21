import { Entity } from '@explorers-club/schema';
import { Atom } from 'nanostores';
import { useSyncExternalStore } from 'react';

export const useEntityStoreSelector = <TEntity extends Entity, TResult>(
  store: Atom<TEntity | null>,
  selector: (entity: TEntity) => TResult
) => {
  const initialEntity = store.get();
  console.log('sel1', initialEntity);
  let value = initialEntity ? selector(initialEntity) : undefined;
  console.log('sel2', value);

  const subscribe = (onStoreChange: () => void) => {
    let unsub: Function | undefined;

    // todo dry this up w/ below ?
    if (initialEntity) {
      unsub = initialEntity.subscribe(() => {
        const nextValue = selector(initialEntity);
        console.log({ value, nextValue });

        if (value !== nextValue) {
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
        console.log({ value, nextValue });

        if (value !== nextValue) {
          value = nextValue;
          onStoreChange();
        }
      });

      const nextValue = selector(entity);
      if (value !== nextValue) {
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
