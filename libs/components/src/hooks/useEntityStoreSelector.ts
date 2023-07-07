import { Entity } from '@explorers-club/schema';
import { Atom } from 'nanostores';
import { useSyncExternalStore } from 'react';

export const useEntityStoreSelector = <TEntity extends Entity, TResult>(
  store: Atom<TEntity | null>,
  selector: (entity: TEntity) => TResult
) => {
  let entity = store.get();
  let value = entity ? selector(entity) : undefined;

  const subscribe = (onStoreChange: () => void) => {
    let unsub: Function | undefined;
    return store.listen((entity) => {
      console.log('ENTITY CHANGIN!', entity);
      if (!entity) {
        if (unsub) {
          unsub();
        }
        value = undefined;
        return;
      }

      unsub = entity.subscribe(() => {
        const nextValue = selector(entity);
        // console.log({ nextValue }, entity);
        if (value !== nextValue) {
          // console.log('updating', value);
          value = nextValue;
          onStoreChange();
        }
      });

      const nextValue = selector(entity);
      if (value !== nextValue) {
        value = nextValue;
        // console.log('updating', value);
        onStoreChange();
      }
    });
  };

  const getSnapshot = () => {
    return value;
  };

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};
