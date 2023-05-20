import { ConnectionEntity, Entity, InitializedConnectionEntity, LayoutProps, RouteName, SnowflakeId } from '@explorers-club/schema';
import { O } from '@mobily/ts-belt';
import { World } from 'miniplex';
import { atom, computed, onMount } from 'nanostores';

const world = new World<Entity>();

export const worldStore = atom(world);

export const connectionId = atom<SnowflakeId | undefined>(undefined);

const entitiesById = new Map<SnowflakeId, Entity>();
world.onEntityAdded.add((entity) => {
  entitiesById.set(entity.id, entity);
});
world.onEntityRemoved.add((entity) => {
  entitiesById.delete(entity.id);
});

export const entitiesByIdStore = atom(entitiesById);

export const createEntityStore = <TEntity extends Entity>(
  query: (entity: TEntity) => boolean
) => {
  const store = atom<TEntity | null>(null);
  for (const entity of world.entities) {
    store.set(entity as TEntity);
  }

  world.onEntityAdded.add((entity) => {
    if (query(entity as TEntity)) {
      store.set(entity as TEntity);
    }
  });

  world.onEntityRemoved.add((entity) => {
    if (store.get() === entity) {
      store.set(null);
    }
  });

  return store;
};

// export const createEntityComputedStore = <TEntity extends Entity, TValue>(
//   query: (entity: TEntity) => boolean,
//   fn: (value: TEntity) => TValue,
//   defaultValue: TValue
// ) => {
//   const entityStore = createEntityStore<TEntity>(query);

//   return computed(entityStore, (entity: TEntity | null) => {
//     if (entity) {
//       return fn(entity);
//     }

//     return defaultValue;
//   });
// };

export const myConnectionEntityStore = createEntityStore<ConnectionEntity>(
  (entity) => entity.schema === 'connection'
);

export const myInitializedConnectionEntityStore = computed(myConnectionEntityStore, (entity) => {
  if (entity && entity.states.Initialized === "True") {
    return entity as InitializedConnectionEntity;
  }
  return undefined;
})
