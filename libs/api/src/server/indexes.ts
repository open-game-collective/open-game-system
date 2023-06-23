import { createSchemaIndex } from '../indices';
import { world } from './state';

export const [connectionsById] = createSchemaIndex(world, 'connection', 'id');
export const [sessionsById] = createSchemaIndex(world, 'session', 'id');
export const [sessionsByUserId] = createSchemaIndex(world, 'session', 'userId');
export const [roomsBySlug] = createSchemaIndex(world, 'room', 'slug');
export const [usersById] = createSchemaIndex(world, 'user', 'id');
