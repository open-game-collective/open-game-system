import { createMachine, interpret } from 'xstate';
import { Entity, SendMessageInvokeMeta } from '@explorers-club/schema';
import { World } from 'miniplex';
import { createIndex } from '../world';
import { eventTriggerDispatchMachine } from '../services/event-trigger-dispatch.service';
import { greetOnJoinTrigger } from '../configs/triggers';

export const world = new World<Entity>();
export const entitiesById = createIndex(world);

const triggerDispatchService = interpret(
  eventTriggerDispatchMachine.withContext({
    world,
    triggerEntities: {},
    entitiesById,
    configs: [greetOnJoinTrigger],
  })
);
triggerDispatchService.start();
