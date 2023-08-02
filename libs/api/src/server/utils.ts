import { assertEntitySchema } from '@explorers-club/utils';
import { entitiesById } from '..';
import { SnowflakeId } from '@schema/types';

export const getSenderEntities = (senderId: SnowflakeId) => {
  const connectionEntity = entitiesById.get(senderId);
  assertEntitySchema(connectionEntity, 'connection');

  const { sessionId } = connectionEntity;
  const sessionEntity = entitiesById.get(sessionId);
  assertEntitySchema(sessionEntity, 'session');

  const { userId } = sessionEntity;
  const userEntity = entitiesById.get(userId);
  assertEntitySchema(userEntity, 'user');

  return { connectionEntity, sessionEntity, userEntity };
};
