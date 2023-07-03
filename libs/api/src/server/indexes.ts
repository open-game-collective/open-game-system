import {
  ConnectionEntity,
  RoomEntity,
  SessionEntity,
  // TriggerEntity,
  UserEntity,
} from '@explorers-club/schema';
import { createArchetypeIndex, createSchemaIndex } from '../indices';
import { world } from './state';

export const [connectionsById] = createSchemaIndex<ConnectionEntity>(
  world,
  'connection',
  'id'
);
export const [connectionsByAccessToken, connectionsByAccessToken$] =
  createSchemaIndex<ConnectionEntity>(world, 'connection', 'accessToken');

export const [sessionsById] = createSchemaIndex<SessionEntity>(
  world,
  'session',
  'id'
);
export const [sessionsByUserId] = createSchemaIndex<SessionEntity>(
  world,
  'session',
  'userId'
);
export const [roomsBySlug] = createSchemaIndex<RoomEntity>(
  world,
  'room',
  'slug'
);
export const [usersById] = createSchemaIndex<UserEntity>(world, 'user', 'id');
// export const [triggersById] = createSchemaIndex<TriggerEntity>(
//   world,
//   'trigger',
//   'id'
// );
export const [channelEntitiesById] = createArchetypeIndex(
  world.with('channel')
);
