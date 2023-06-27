import {
  ChannelEvent,
  Entity,
  EventTriggerConfigSchema,
  SnowflakeId,
  TriggerEntity,
} from '@explorers-club/schema';
import { assert, fromWorld } from '@explorers-club/utils';
import { World } from 'miniplex';
import { Observable, mergeMap } from 'rxjs';
import { assign, createMachine } from 'xstate';
// import { generateSnowflakeId } from '../ecs';
import { generateSnowflakeId } from '../ids';

export const eventTriggerDispatchMachine = createMachine({
  id: 'EventTriggerDispatchMachine',
  initial: 'Running',
  schema: {
    context: {} as {
      world: World<Entity>;
      entitiesById: Map<SnowflakeId, Entity>;
      configs: EventTriggerConfigSchema[];
      triggerEntities: Record<SnowflakeId, TriggerEntity>;
    },
    events: {} as ChannelEvent,
  },
  states: {
    Running: {
      on: {
        '*': {
          actions: assign({
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

                // Inject services/actions/guards
                const workflowId = generateSnowflakeId();
                // const machine = config.workflowConfig
                //   .withContext({
                //     workflowId,
                //     input: {
                //       entity,
                //       event,
                //       metadata: {}, // todo be able to populate from config / webhook
                //     },
                //     triggerConfig: config,
                //   })
                //   .withConfig({
                //     guards: workflowGuards as any,
                //     actions: workflowActions as any,
                //     services: workflowServices as any,
                //     delays: {},
                //   });
                // const ref = spawn(machine);

                // todo
                // const triggerEntity = createEntity<TriggerEntity>({
                //   schema: 'trigger',
                //   config,
                // });
                // world.add(triggerEntity);
                // result[triggerEntity.id] = triggerEntity;
              }
              return result;
            },
          }),
        },
      },
      invoke: {
        src: (context) =>
          fromWorld(context.world).pipe(
            mergeMap(
              (entity) => entity.channel as unknown as Observable<ChannelEvent>
            )
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
