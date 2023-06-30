import {
  ChannelEvent,
  CreateEventProps,
  Entity,
  EntityMachineMap,
  // EntityMessageMap,
  EntityServiceKeys,
  EventTriggerConfigSchema,
  InitialEntityProps,
  SnowflakeId,
  TriggerEntity,
  TriggerInput
} from '@explorers-club/schema';
// import { EventTriggerConfigSche}
// import { TriggerInputSchema } from '@schema/lib/trigger';
import { assert, fromWorld } from '@explorers-club/utils';
import { compare } from 'fast-json-patch';
import { enablePatches, produce, setAutoFreeze } from 'immer';
import { Observable, ReplaySubject, map, mergeMap } from 'rxjs';
import {
  AnyActorRef,
  InterpreterFrom,
  assign,
  createMachine,
  interpret,
} from 'xstate';
import { generateSnowflakeId } from './ids';
import { machineMap } from './machines';
import { channelsById, entitiesById, world } from './server/state';
// import { eventTriggerDispatchMachine } from './services/event-trigger-dispatch.service';
import { World } from 'miniplex';
import { greetOnJoinTrigger } from './configs/triggers';
import { ChangeEvent } from 'react';

enablePatches();
setAutoFreeze(false);

/**
 * Isomorphic function for creating an entity.
 * We need to dynamically register the machines on the client.
 * @param entityProps
 * @returns
 */
export const createEntity = <TEntity extends Entity>(
  entityProps: InitialEntityProps<TEntity>
) => {
  type PropNames = keyof TEntity;
  type ServiceId = EntityServiceKeys<TEntity>;
  type TCallback = Parameters<TEntity['subscribe']>[0];
  type TEvent = Parameters<TCallback>[0];
  // type TMessage = EntityMessageMap[typeof entityProps.schema]['message'];
  type TMachine = EntityMachineMap[typeof entityProps.schema]['machine'];
  type TInterpreter = InterpreterFrom<TMachine>;
  type TStateValue = TEntity['states'];
  type TCommand = Parameters<TEntity['send']>[0];
  const id = generateSnowflakeId();

  const subscriptions = new Set<TCallback>();

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

  const handler: ProxyHandler<TEntity> = {
    set: (target, property, value) => {
      const nextTarget = produce(target, (draft) => {
        type Prop = keyof typeof draft;
        draft[property as Prop] = value;
      });
      // console.log(property, value, target);
      // delete nextTarget['channel']; // hack

      const patches = compare(target, nextTarget);
      target[property as PropNames] = value;

      if (patches.length) {
        next({
          type: 'CHANGE',
          patches,
        });
      }

      return true; // Indicate that the assignment was successful
    },
    ownKeys(target) {
      // 'channel' prop doesn't serialize, it's a ReplaySubject
      // it is implemenented differently on client.
      return Object.keys(target).filter((key) => key !== 'channel');
    },
  };

  /**
   * The send method collects events to be processed on central queues
   * @param command
   */
  const send = (command: TCommand) => {
    next({
      type: 'SEND_TRIGGER',
      command,
    } as TEvent);
    // proxy.command = command;
    service.send(command);

    next({
      type: 'SEND_COMPLETE',
      command,
    } as TEvent);
  };

  // const broadcast = (message: TMessage) => {
  //   next({
  //     type: 'MESSAGE',
  //     message,
  //   } as TEvent);
  // }

  const entityBase = {
    id,
    send,
    subscribe,
  };

  const channelSubject = new ReplaySubject<CreateEventProps<ChannelEvent>>(
    5 /* msg buffer size */
  );
  const channelObservable = channelSubject.pipe(
    map((event) => {
      return {
        ...event,
        id: generateSnowflakeId(),
        channelId: id,
      } as ChannelEvent;
    })
  );
  channelsById.set(id, channelObservable);

  const entity: TEntity = {
    ...entityBase,
    ...entityProps,
  } as unknown as TEntity; // todo fix hack, pretty sure this works though

  const proxy = new Proxy(entity, handler);
  const machine = machineMap[entityProps.schema]({
    world,
    entity: proxy,
    channel: channelSubject,
  });
  // todo fix types
  const service = interpret(machine as any) as unknown as TInterpreter;

  service.start();

  proxy.states = service.getSnapshot().value as TStateValue;

  const attachedServices: Partial<Record<ServiceId, AnyActorRef>> = {};

  const attachService = (serviceId: ServiceId, actor: AnyActorRef) => {
    attachedServices[serviceId] = actor;

    actor.subscribe((state) => {
      proxy[serviceId] = {
        value: state.value,
        context: state.context,
      } as any;
    });
  };

  const detachService = (serviceId: ServiceId) => {
    delete attachedServices[serviceId];
    proxy[serviceId] = undefined as any; // better way ?;
  };

  // Listens for new children on the xstate actor
  // and attach/detach it as a service
  service.onTransition((state) => {
    for (const child in state.children) {
      const serviceId = child as ServiceId; // Is this safe to assume?
      const actor = state.children[child];
      if (!attachedServices[serviceId] && actor.getSnapshot()) {
        attachService(serviceId, state.children[child]);
      }
    }

    for (const serviceId in attachedServices) {
      const actor = state.children[serviceId];
      if (!actor) {
        detachService(serviceId);
      }
    }

    proxy.states = state.value as TStateValue;
  });

  return proxy;
};

type TriggerDispatchContext = {
  world: World<Entity>;
  entitiesById: Map<SnowflakeId, Entity>;
  configs: EventTriggerConfigSchema[];
  triggerEntities: Record<SnowflakeId, TriggerEntity>;
};

const eventTriggerDispatchMachine = createMachine({
  id: 'EventTriggerDispatchMachine',
  initial: 'Running',
  schema: {
    context: {} as TriggerDispatchContext,
    events: {} as ChannelEvent,
  },
  states: {
    Running: {
      on: {
        '*': {
          actions: 'maybeCreateEventTriggerEntity',
        },
      },
      invoke: {
        src: (context) =>
          fromWorld(context.world).pipe(
            mergeMap((entity) => {
              const channel = channelsById.get(entity.id);
              assert(channel, 'expected channel when creating trigger');
              return channel;
            })
          ),
        onDone: 'Done',
        onError: 'Error',
      },
    },
    Done: {
      entry: () => {
        console.log('DONE!');
      },
    },
    Error: {},
  },
});

const eventTriggerDispatchService = interpret(
  eventTriggerDispatchMachine
    .withContext({
      world,
      triggerEntities: {},
      entitiesById,
      configs: [greetOnJoinTrigger],
    })
    .withConfig({
      actions: {
        maybeCreateEventTriggerEntity: assign({
          triggerEntities: (
            { entitiesById, configs, triggerEntities },
            event
          ) => {
            const entity = entitiesById.get(event.channelId);
            assert(
              entity,
              'expected channel entity when processing channel event but not found, channelId: ' +
                event.channelId
            );
            const result = {
              ...triggerEntities,
            };
            for (const config of configs) {
              // Must match entity schema
              if (entity.schema !== config.entity.schema) {
                break;
              }
              // Must match event type
              if (event.type !== config.event.type) {
                break;
              }

              // TODO future filters/matchers go here

              const triggerEntity = createEntity<TriggerEntity>({
                schema: 'trigger',
                config,
                input: {
                  triggerType: 'event',
                  entity,
                  event,
                  metadata: {},
                } satisfies TriggerInput,
                // input:
              });

              world.add(triggerEntity);
              result[triggerEntity.id] = triggerEntity;
            }
            return result;
          },
        }),
      },
    })
);
eventTriggerDispatchService.start();
