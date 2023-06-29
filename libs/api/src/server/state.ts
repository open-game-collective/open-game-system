import { ChannelEvent, Entity, SnowflakeId } from '@explorers-club/schema';
import { World } from 'miniplex';
import { createIndex } from '../world';
import { Observable } from 'rxjs';

export const world = new World<Entity>();
export const entitiesById = createIndex(world);
export const channelsById = new Map<SnowflakeId, Observable<ChannelEvent>>();
