import { ConnectionEntity, Entity, SnowflakeId } from '@explorers-club/schema';
import { World } from 'miniplex';
import { atom, computed } from 'nanostores';

const world = new World<Entity>();

export const worldStore = atom(world);

export const connectionId = atom<SnowflakeId | undefined>(undefined);

export const myConnectionEntityStore = atom<ConnectionEntity | null>(null);

const entitiesById = new Map<SnowflakeId, Entity>();
export const entitiesByIdStore = atom(entitiesById);

world.onEntityAdded.add((entity) => {
  if (entity.schema === 'connection') {
    myConnectionEntityStore.set(entity);
  }
  entitiesById.set(entity.id, entity);
});
world.onEntityRemoved.add((entity) => {
  entitiesById.delete(entity.id);
});
