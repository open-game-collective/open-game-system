// Isomorphic file
// do not put anything that is server or client specific in here
// gets included with the api-client
import { Entity, SnowflakeId } from '@explorers-club/schema';
import { World } from 'miniplex';

export const createIndex = (world: World) => {
  const entitiesById = new Map<SnowflakeId, Entity>();
  for (const entity of world.entities) {
    entitiesById.set(entity.id, entity);
  }

  world.onEntityAdded.add((entity) => {
    entitiesById.set(entity.id, entity);
  });
  world.onEntityRemoved.add((entity) => {
    entitiesById.delete(entity.id);
  });

  return entitiesById;
};

export const waitForEntity = <TEntity extends Entity>(
  world: World<Entity>,
  entitiesById: Map<SnowflakeId, Entity>,
  id: SnowflakeId,
  timeout = 10000
) => {
  const entity = entitiesById.get(id);
  if (entity) {
    return Promise.resolve(entity as TEntity);
  }

  return new Promise<TEntity>((resolve, reject) => {
    const unsub = world.onEntityAdded.add((entity) => {
      if (entity.id === id) {
        resolve(entity as TEntity);
        unsub();
        clearTimeout(timer);
      }
    });

    const timer = setTimeout(() => {
      reject(new Error('timed out waiting for entity ' + id));
      unsub();
    }, timeout);
  });
};

// const waitForCondition = async<TEntity extends Entity>

// todo fix "double timeout" on this method
// Overload signature
export async function waitForCondition<TEntity extends Entity>(
  entity: TEntity,
  condition: (entity: TEntity) => boolean,
  timeoutMs?: number
): Promise<TEntity>;

// Original function signature
export async function waitForCondition<TEntity extends Entity>(
  world: World<Entity>,
  entitiesById: Map<SnowflakeId, Entity>,
  id: SnowflakeId,
  condition: (entity: TEntity) => boolean,
  timeoutMs?: number
): Promise<TEntity>;

// Function implementation
export async function waitForCondition<TEntity extends Entity>(
  worldOrEntity: World<Entity> | TEntity,
  entitiesByIdOrCondition:
    | Map<SnowflakeId, Entity>
    | ((entity: TEntity) => boolean),
  idOrTimeout?: SnowflakeId | number,
  conditionOrNothing?: ((entity: TEntity) => boolean) | number,
  timeoutMs?: number
): Promise<TEntity> {
  let entity: TEntity;
  let condition: (entity: TEntity) => boolean;
  if (worldOrEntity instanceof World) {
    const world = worldOrEntity as World<Entity>;
    const entitiesById = entitiesByIdOrCondition as Map<SnowflakeId, Entity>;
    const id = idOrTimeout as SnowflakeId;
    condition = conditionOrNothing as (entity: TEntity) => boolean;
    entity = await waitForEntity<TEntity>(world, entitiesById, id, timeoutMs);
  } else {
    entity = worldOrEntity as TEntity;
    condition = entitiesByIdOrCondition as (entity: TEntity) => boolean;
    timeoutMs = (idOrTimeout as number) || timeoutMs;
  }

  if (condition(entity)) {
    return Promise.resolve(entity);
  }

  return new Promise<TEntity>((resolve, reject) => {
    let timer: NodeJS.Timeout;
    const unsub = entity.subscribe((s) => {
      if (condition(entity)) {
        timer && clearTimeout(timer);
        resolve(entity);
        unsub();
      }
    });

    if (timeoutMs) {
      timer = setTimeout(() => {
        unsub();
        reject(new Error('timed out waiting for entity' + entity.id));
      }, timeoutMs);
    }
  });
}
