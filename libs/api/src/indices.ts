import {
  Entity,
  EntitySchemas,
  EntitySchemaType,
  SnowflakeId,
} from '@explorers-club/schema';
import { assert, FromArchetype, FromSubject } from '@explorers-club/utils';
import { ArchetypeBucket, World } from 'miniplex';
import { Observable, Subject } from 'rxjs';
import { AnyFunction } from 'xstate';
import { z } from 'zod';
import { EntityIndexEvent } from './events';

type IndexFunction = (entity: Entity) => string;

type IndexKey = string | string[] | IndexFunction;

export const createSchemaIndex = <TEntity extends Entity>(
  world: World<Entity>,
  schemaType: keyof typeof EntitySchemas,
  key: IndexKey
) => {
  // const schema = EntitySchemas[schemaType];
  // type TEntity = z.infer<typeof schema>;

  const index = new Map<string, TEntity>();
  const subject = new Subject<EntityIndexEvent<TEntity>>();

  const getIndexKey = (entity: TEntity) => {
    if (typeof key === 'function') {
      return key(entity);
    } else if (typeof key === 'string') {
      return entity[key as keyof TEntity];
    } else {
      return key
        .map((keyComponent) => entity[keyComponent as keyof TEntity])
        .join('-');
    }
  };

  const entitySubscriptionsMap = new Map<SnowflakeId, AnyFunction>();

  world.onEntityAdded.add((entity) => {
    if (entity.schema !== schemaType) {
      return;
    }

    const key = getIndexKey(entity as TEntity) as string;
    if (index.has(key)) {
      console.warn('index received duplicate key igorning', key);
      return;
    }

    index.set(key, entity as TEntity);
    subject.next({
      type: 'ADD',
      data: entity as TEntity,
    });

    const entitySubscription = entity.subscribe((event) => {
      // TODO handle change
      // if (event.type === 'CHANGE') {
      //   subject.next({
      //     type: 'CHANGE',
      //     data: entity,
      //     delta: event.delta as EntityChangeDelta<TEntity>,
      //   });
      // }
    });

    entitySubscriptionsMap.set(entity.id, entitySubscription);
  });

  world.onEntityRemoved.add((entity) => {
    if (entity.schema !== schemaType) {
      return;
    }

    const key = getIndexKey(entity as TEntity) as string;
    index.delete(key);

    const entitySubscription = entitySubscriptionsMap.get(entity.id);
    if (entitySubscription) {
      entitySubscription();
    } else {
      console.warn(
        "expected entity subscritption but didn't find one for ",
        entity.id
      );
    }

    subject.next({
      type: 'REMOVE',
      data: entity as TEntity,
    });
  });

  subject.next({
    type: 'INIT',
    data: world.entities as TEntity[], // todo filter for access
  });

  return [index, subject as Observable<FromSubject<typeof subject>>] as const;
};

export const createArchetypeIndex = <TEntity extends Entity>(
  bucket: ArchetypeBucket<TEntity>
) => {
  type BucketEntity = FromArchetype<typeof bucket>;
  const index = new Map<string, BucketEntity>();
  const subject = new Subject<EntityIndexEvent<TEntity>>();

  for (const entity of bucket) {
    index.set(entity.id, entity);
  }

  bucket.onEntityAdded.add((entity) => {
    assert(!index.has(entity.id), 'expected entity to not already exist');

    index.set(entity.id, entity);
  });

  bucket.onEntityRemoved.add((entity) => {
    index.delete(entity.id);
  });

  return [index, subject as Observable<FromSubject<typeof subject>>] as const;
};
