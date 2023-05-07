import { Entity, SnowflakeId } from '@explorers-club/schema';
import { World } from 'miniplex';

export const world = new World<Entity>();

export const entitiesById = new Map<SnowflakeId, Entity>();
world.onEntityAdded.add((entity) => {
  entitiesById.set(entity.id, entity);
});
world.onEntityRemoved.add((entity) => {
  entitiesById.delete(entity.id);
});

export const waitForEntity = <TEntity extends Entity>(
  id: SnowflakeId,
  timeout = 10000
) => {
  const entity = entitiesById.get(id);
  if (entity) {
    return Promise.resolve(entity as TEntity);
  }

  return new Promise<TEntity>((resolve, reject) => {
    console.log('WAIT callp', entity);
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

// todo fix "double timeout" on this method
export const waitForCondition = async <TEntity extends Entity>(
  id: SnowflakeId,
  condition: (entity: TEntity) => boolean,
  timeoutMs = 10000
) => {
  const entity = await waitForEntity<TEntity>(id, timeoutMs);
  if (condition(entity)) {
    return Promise.resolve(entity);
  }

  return new Promise<TEntity>((resolve, reject) => {
    console.log("check condition", entity, condition(entity));

    const unsub = entity.subscribe((s) => {
      console.log('waiting for condition', entity);
      if (condition(entity)) {
        clearTimeout(timer);
        resolve(entity);
        unsub();
      }
    });

    const timer = setTimeout(() => {
      unsub();
      reject(new Error('timed out waiting for entity' + entity.id));
    }, timeoutMs);
  });
};

// export const waitFor = <TEntity extends Entity>(
//   entity: Entity,
//   condition: (entity: TEntity) => boolean,
//   timeoutMs = 10000
// ) =>
//   new Promise<TEntity>((resolve, reject) => {
//     const entity = entitiesById.get(id) as TEntity | undefined;

//     // if (!entity) {
//     //     const sub = world.onEntityAdded.add((entity) => {

//     //     })
//     // }

//     if (condition(entity)) {
//       resolve(entity);
//       return;
//     }

//     const timer = setTimeout(() => {
//       unsub();
//       reject(new Error('timed out waiting for entity' + entity.id));
//     }, timeoutMs);
//     clearTimeout(timer);
//     // console.log('SET UP TIMEOUT', timeout);
//     const unsub = entity.subscribe((s) => {
//       // console.log('EVENT!', s, condition(entity));
//       if (condition(entity)) {
//         clearTimeout(timer);
//         resolve(entity);
//         unsub();
//         return true;
//       }
//       return false;
//     });
//   });
