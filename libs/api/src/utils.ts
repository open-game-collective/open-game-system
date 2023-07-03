import { Entity } from '@explorers-club/schema';
import { TRPCError } from '@trpc/server';
import * as JWT from 'jsonwebtoken';

export const getSessionId = (accessToken: string) => {
  const parsedAccessToken = JWT.decode(accessToken);
  if (
    typeof parsedAccessToken === 'object' &&
    parsedAccessToken &&
    'session_id' in parsedAccessToken
  ) {
    return parsedAccessToken['session_id'];
  }
  return null;
};

export const getUserId = (refreshToken: string) => {
  const parsedAccessToken = JWT.verify(refreshToken, 'my_private_key');
  if (
    typeof parsedAccessToken === 'object' &&
    parsedAccessToken
  ) {
    return parsedAccessToken.sub;
  }
  return null;
};
