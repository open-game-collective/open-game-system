import { ChannelEvent, ChannelEventInput, Entity, SnowflakeId } from '@explorers-club/schema';
import { World } from 'miniplex';
import { Observable, ReplaySubject } from 'rxjs';
import { createIndex } from '../world';

export const world = new World<Entity>();
export const entitiesById = createIndex(world);
export const channelObservablesById = new Map<
  SnowflakeId,
  Observable<ChannelEvent>
>();
export const channelSubjectsById = new Map<
  SnowflakeId,
  ReplaySubject<ChannelEventInput>
>();

// todo make persistence
// pretend this is a database table
export const refreshTokensByUserId = new Map<SnowflakeId, string>();
