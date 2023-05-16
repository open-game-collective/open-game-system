import { Entity, SnowflakeId } from '@explorers-club/schema';
import { World } from 'miniplex';
import { atom } from 'nanostores';

const world = new World<Entity>();

export const worldStore = atom(world);

const entitiesById = new Map<SnowflakeId, Entity>();
export const entitiesByIdStore = atom(entitiesById);

world.onEntityAdded.add((entity) => {
  entitiesById.set(entity.id, entity);
});
world.onEntityRemoved.add((entity) => {
  entitiesById.delete(entity.id);
});

export const connectionId = atom<SnowflakeId | undefined>(undefined);
