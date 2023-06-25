import { ChannelEvent, Entity, TriggerConfig } from '@explorers-club/schema';
import { fromWorld } from '@explorers-club/utils';
import { World } from 'miniplex';
import { Observable, mergeMap, switchMap } from 'rxjs';
import { AnyEventObject, createMachine } from 'xstate';

export const triggerDispatchMachine = createMachine({
  id: 'TriggerDispatchMachine',
  initial: 'Running',
  schema: {
    context: {} as { world: World<Entity>; configs: TriggerConfig[] },
    events: {} as ChannelEvent,
  },
  states: {
    Running: {
      on: {
        '*': {
          actions: ({ world }, event) => {
            console.log('receved channel event', event);
          },
        },
      },
      invoke: {
        src: (context) => {
          return fromWorld(context.world).pipe(
            mergeMap(
              (entity) => entity.channel as unknown as Observable<ChannelEvent>
            )
          );
        },
        // on: {
        //     JO
        // }
        onError: 'Error',
      },
    },
    Error: {},
  },
});
