import { world } from '@explorers-club/api-client';
import type {
  ConnectionEntity,
  Entity,
  InitializedConnectionEntity,
  SnowflakeId,
} from '@explorers-club/schema';
import { atom } from 'nanostores';

export const worldStore = atom(world);

export const connectionId = atom<SnowflakeId | undefined>(undefined);

export const createEntityStore = <TEntity extends Entity>(
  query: (entity: Entity) => boolean
) => {
  const store = atom<TEntity | null>(null);
  for (const entity of world.entities) {
    if (query(entity)) {
      store.set(entity as TEntity);
    }
  }

  world.onEntityAdded.add((entity) => {
    if (query(entity as TEntity)) {
      store.set(entity as TEntity);
    }

    entity.subscribe(() => {
      if (!store.get() && query(entity as TEntity)) {
        store.set(entity as TEntity);
      }

      if (store.get() && !query(entity as TEntity)) {
        store.set(null);
      }
    });
  });

  world.onEntityRemoved.add((entity) => {
    if (store.get() === entity) {
      store.set(null);
    }
  });

  return store;
};

export const myConnectionEntityStore = createEntityStore<ConnectionEntity>(
  (entity) => entity.schema === 'connection'
);

export const myInitializedConnectionEntityStore =
  createEntityStore<InitializedConnectionEntity>(
    (entity) =>
      entity.schema === 'connection' && entity.states.Initialized === 'True'
  );
