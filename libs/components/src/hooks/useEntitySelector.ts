import { Entity } from '@explorers-club/schema';
import { deepEqual } from '@explorers-club/utils';
import structuredClone from '@ungap/structured-clone';
import { useSyncExternalStore } from 'react';
import { useRef, useMemo } from 'react';

export const useEntitySelector = <
  TEntity extends Entity,
  TResult extends number | string | boolean | undefined
>(
  entity: TEntity,
  selector: (entity: TEntity) => TResult,
  deps: any[] = [] // dependencies array
) => {
  // Store the previous deps to check for changes
  const prevDepsRef = useRef<any[]>();

  // Memoized value based on dependencies
  const memoizedValue = useMemo(() => selector(entity), deps);

  const didDepsChange =
    !prevDepsRef.current ||
    deps.some((dep, index) => !Object.is(dep, prevDepsRef.current![index]));

  // Update the stored deps
  prevDepsRef.current = deps;

  let value = didDepsChange ? memoizedValue : (selector(entity) as TResult);

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

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};

export const useEntitySelectorDeepEqual = <TEntity extends Entity, TResult>(
  entity: TEntity,
  selector: (entity: TEntity) => TResult
) => {
  let value = structuredClone(selector(entity)) as TResult;

  const subscribe = (onStoreChange: () => void) => {
    const unsub = entity.subscribe((event) => {
      const nextValue = selector(entity) as TResult;
      if (!deepEqual(value, nextValue)) {
        value = structuredClone(nextValue);
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

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};
