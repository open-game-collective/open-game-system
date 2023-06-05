import { trpc } from '@explorers-club/api-client';
import {
  ConnectionEntity,
  Entity,
  InitializedConnectionEntity,
  SnowflakeId,
  SyncedEntityProps,
} from '@explorers-club/schema';
import { useStore } from '@nanostores/react';
import { applyPatch } from 'fast-json-patch';
import { Atom, WritableAtom, atom } from 'nanostores';
import { createIndex } from 'libs/api/src/world';
import { World } from 'miniplex';
import {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Selector } from 'reselect';
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector';

type EntityRegistry = {
  myConnectionEntity: ConnectionEntity;
  myInitializedConnectionEntity: InitializedConnectionEntity;
};

type EntityStoreRegistry = {
  [K in keyof EntityRegistry]: Atom<EntityRegistry[K] | null>;
};

// Update the WorldContextType to include the entity type T.
type WorldContextType = {
  world: World<Entity>;
  entitiesById: Map<SnowflakeId, Entity>;
  entityStoreRegistry: EntityStoreRegistry;
  createEntityStore: <TEntity extends Entity>(
    query: (entity: Entity) => boolean
  ) => WritableAtom<TEntity | null>;
  useEntitySelector: <T extends Entity, R>(
    id: SnowflakeId,
    selector: Selector<T, R>
  ) => R;
};

export const WorldContext = createContext({} as WorldContextType);

declare global {
  interface Window {
    $WORLD: World<Entity>;
  }
}

export const WorldProvider: FC<{
  children: ReactNode;
  world: World<Entity>;
}> = ({ children, world }) => {
  const { client } = trpc.useContext();
  type Callback = Parameters<Entity['subscribe']>[0];
  const entitiesById = createIndex(world);
  // window.$WORLD = world;
  // const [subscribersById] = useState(new Map<SnowflakeId, Set<() => void>>());
  const [nextFnById] = useState(new Map<SnowflakeId, Callback>());

  const createEntity = useCallback(
    <TEntity extends Entity>(entityProps: SyncedEntityProps<TEntity>) => {
      type TCommand = Parameters<TEntity['send']>[0];
      type TCallback = Parameters<TEntity['subscribe']>[0];
      type TEvent = Parameters<TCallback>[0];

      const id = entityProps.id;
      const subscriptions = new Set<TCallback>();

      const send = async (command: TCommand) => {
        next({
          type: 'SEND_TRIGGER',
          command,
        } as TEvent);
        await client.entity.send.mutate({
          id,
          event: command,
        });
        next({
          type: 'SEND_COMPLETE',
          command,
        } as TEvent);
      };

      const subscribe = (callback: TCallback) => {
        subscriptions.add(callback);

        return () => {
          subscriptions.delete(callback);
        };
      };

      const next = (event: TEvent) => {
        for (const callback of subscriptions) {
          callback(event as any); // todo fix TS not liking nested union types on event
        }
      };
      nextFnById.set(id, next);

      const entity: TEntity = {
        send,
        subscribe,
        ...entityProps,
      } as unknown as TEntity;
      // todo add send and subscribe methods here
      return entity;
    },
    [client, nextFnById]
  );

  useEffect(() => {
    const sub = client.entity.list.subscribe(undefined, {
      onError(err) {
        console.error(err);
      },
      onData(event) {
        if (event.type === 'ADDED') {
          for (const entityProps of event.entities) {
            const entity = createEntity(entityProps);

            entitiesById.set(entityProps.id, entity);
            world.add(entity);
          }
        } else if (event.type === 'REMOVED') {
          for (const entityProps of event.entities) {
            const entity = entitiesById.get(entityProps.id);
            if (!entity) {
              console.error('missing entity when trying to remove');
              return;
            }

            world.remove(entity);
          }
        } else if (event.type === 'CHANGED') {
          for (const change of event.changedEntities) {
            const entity = entitiesById.get(change.id);
            if (!entity) {
              console.error('missing entity when trying to apply patches');
              return;
            }

            for (const operation of change.patches) {
              if (operation.path.match(/^\/\w+$/) && operation.op === 'add') {
                const pathParts = operation.path.split('/');
                const component = pathParts[1] as keyof typeof entity;
                world.addComponent(entity, component, operation.value);
              } else if (
                operation.path.match(/^\/\w+$/) &&
                operation.op === 'remove'
              ) {
                const pathParts = operation.path.split('/');
                const component = pathParts[1] as keyof typeof entity;
                world.removeComponent(entity, component);
              } else {
                applyPatch(entity, change.patches);
              }
            }

            const next = nextFnById.get(entity.id);
            if (!next) {
              throw new Error('expected next function for entity ' + entity.id);
            }

            next({
              type: 'CHANGE',
              patches: change.patches,
            });
          }
        }
      },
    });

    return sub.unsubscribe;
  }, [client, createEntity, nextFnById, world]);

  const useEntitySelector = <T extends Entity, R>(
    id: SnowflakeId,
    selector: Selector<T, R>
  ) => {
    const getSnapshot = () => {
      const entity = entitiesById.get(id) as T | undefined;
      if (!entity) {
        throw new Error('entity missing: ' + entity);
      }

      return entity;
    };

    const subscribe = (onStoreChange: () => void) => {
      const entity = entitiesById.get(id);
      if (!entity) {
        throw new Error('entity missing: ' + entity);
      }

      const unsub = entity.subscribe(onStoreChange);

      return () => {
        unsub();
      };
    };

    return useSyncExternalStoreWithSelector(
      subscribe,
      getSnapshot,
      getSnapshot,
      selector
    );
  };

  const createEntityStore = <TEntity extends Entity>(
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
  const entityStoreRegistry = {
    myConnectionEntity: createEntityStore<ConnectionEntity>(
      (entity) => entity.schema === 'connection'
    ),
    myInitializedConnectionEntity:
      createEntityStore<InitializedConnectionEntity>(
        (entity) =>
          entity.schema === 'connection' && entity.states.Initialized === 'True'
      ),
  } satisfies EntityStoreRegistry;

  return (
    <WorldContext.Provider
      value={{
        world,
        entitiesById,
        createEntityStore,
        entityStoreRegistry,
        useEntitySelector,
        // useSend,
      }}
    >
      {children}
    </WorldContext.Provider>
  );
};
