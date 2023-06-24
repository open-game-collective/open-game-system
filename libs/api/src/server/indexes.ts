import { ConnectionEntity, RoomEntity, SessionEntity, UserEntity } from '@explorers-club/schema';
import { createArchetypeIndex, createSchemaIndex } from '../indices';
import { world } from './state';

export const [connectionsById] = createSchemaIndex<ConnectionEntity>(world, 'connection', 'id');
export const [sessionsById] = createSchemaIndex<SessionEntity>(world, 'session', 'id');
export const [sessionsByUserId] = createSchemaIndex<SessionEntity>(world, 'session', 'userId');
export const [roomsBySlug] = createSchemaIndex<RoomEntity>(world, 'room', 'slug');
export const [usersById] = createSchemaIndex<UserEntity>(world, 'user', 'id');
export const [channelEntitiesById] = createArchetypeIndex(world.with('channel'));
