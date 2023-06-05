import { Entity } from '@explorers-club/schema';
import { World } from 'miniplex';
import { createIndex } from './world';

export const world = new World<Entity>();
export const entitiesById = createIndex(world);
