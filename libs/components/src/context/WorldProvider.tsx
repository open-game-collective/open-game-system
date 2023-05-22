import { entitiesById, trpc } from '@explorers-club/api-client';
import { Entity, SnowflakeId, SyncedEntityProps } from '@explorers-club/schema';
import { useStore } from '@nanostores/react';
import { applyPatch } from 'fast-json-patch';
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
import { worldStore } from '../state/world';

// Update the WorldContextType to include the entity type T.
type WorldContextType = {
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

export const WorldProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { client } = trpc.useContext();
  type Callback = Parameters<Entity['subscribe']>[0];
  const world = useStore(worldStore);
  window.$WORLD = world;
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
        await client.entity.send.mutate(command as any);
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

  return (
    <WorldContext.Provider
      value={{
        // useSend,
        useEntitySelector,
      }}
    >
      {children}
    </WorldContext.Provider>
  );
};
