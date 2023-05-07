import { entitiesById, trpc, world } from '@explorers-club/api-client';
import { Entity, SnowflakeId, SyncedEntityProps } from '@explorers-club/schema';
import { applyPatches } from 'immer';
import { World } from 'miniplex';
import { FC, ReactNode, createContext, useCallback, useEffect } from 'react';
import { Selector } from 'reselect';
import { Subject } from 'rxjs';
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector';

// Update the WorldContextType to include the entity type T.
type WorldContextType = {
  world: World<Entity>;
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
  window.$WORLD = world;
  const subscribersById = new Map<SnowflakeId, Set<() => void>>();
  // const subjects$ById = new Map<SnowflakeId, Subject<Callback>>();
  const nextFnById = new Map<SnowflakeId, Callback>();

  const createEntity = useCallback(
    <TEntity extends Entity>(entityProps: SyncedEntityProps<TEntity>) => {
      type TCommand = Parameters<TEntity['send']>[0];
      type TCallback = Parameters<TEntity['subscribe']>[0];
      type TEvent = Parameters<TCallback>[0];

      const id = entityProps.id;
      const subscriptions = new Set<TCallback>();
      // const subject = subjects$ById.get(id) || new Subject<Callback>();
      // if (!subjects$ById.has(id)) {
      //   subjects$ById.set(id, subject);
      // }

      const send = async (command: TCommand) => {
        next({
          type: 'SEND_TRIGGER',
          command,
        } as TEvent);
        await client.entity.send.mutate(command);
        next({
          type: 'SEND_COMPLETE',
          command,
        } as TEvent);
      };

      const subscribe = (callback: TCallback) => {
        console.log('subscribing to entity');
        subscriptions.add(callback);

        return () => {
          subscriptions.delete(callback);
        };
      };

      const next = (event: TEvent) => {
        console.log(id, 'CALLED NEXT', event);
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
    [client]
  );

  useEffect(() => {
    const sub = client.entity.list.subscribe(undefined, {
      onError(err) {
        console.error(err);
      },
      onData(event) {
        for (const entityProps of event.addedEntities) {
          const entity = createEntity(entityProps);

          entitiesById.set(entityProps.id, entity);
          world.add(entity);
        }
        for (const entityProps of event.removedEntities) {
          const entity = entitiesById.get(entityProps.id);
          if (!entity) {
            console.error('missing entity when trying to remove');
            return;
          }

          world.remove(entity);
        }
        for (const changedEntities of event.changedEntities) {
          const entity = entitiesById.get(changedEntities.id);
          if (!entity) {
            console.error('missing entity when trying to apply patches');
            return;
          }

          applyPatches(entity, changedEntities.patches);

          const next = nextFnById.get(entity.id);
          if (!next) {
            throw new Error('expected next function for entity ' + entity.id);
          }
          next({
            type: 'CHANGE',
            patches: changedEntities.patches,
          });
        }
      },
    });

    return sub.unsubscribe;
  }, [client, createEntity, nextFnById]);

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
        world,
        // useSend,
        useEntitySelector,
      }}
    >
      {children}
    </WorldContext.Provider>
  );
};
