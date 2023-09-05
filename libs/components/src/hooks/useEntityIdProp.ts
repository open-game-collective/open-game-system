import { Entity, SnowflakeId } from '@explorers-club/schema';
import { useMemo } from 'react';
import { useCreateEntityStore } from './useCreateEntityStore';
import { useEntityStoreSelector } from './useEntityStoreSelector';

export function useEntityIdProp<
  TEntity extends Entity,
  TKey extends keyof TEntity
>(id: SnowflakeId, prop: TKey): TEntity[TKey] | undefined {
  const entityStore = useCreateEntityStore<TEntity>(
    (query) => query.id === id,
    [id]
  );
  const selector = useMemo(() => {
    return () => {
      const entity = entityStore.get();
      return entity ? entity[prop] : null;
    };
  }, [entityStore, prop]);
  return useEntityStoreSelector(entityStore, selector) as
    | TEntity[TKey]
    | undefined;
}
