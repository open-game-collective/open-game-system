import { generateSnowflakeId } from '@api/ids';
import type { ApiRouter } from '@api/index';
import { transformer } from '@api/transformer';
import { assert } from '@explorers-club/utils';
import type { RouteProps, SnowflakeId } from '@schema/types';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AstroCookies, MiddlewareResponseHandler } from 'astro';
import { defineMiddleware, sequence } from 'astro/middleware';
import * as jose from 'jose';
import * as JWT from 'jsonwebtoken';
import { getRouteProps } from './routing';

const alg = 'HS256';
export interface MiddlewareProps {
  initialRouteProps: RouteProps;
  connectionId: SnowflakeId;
  apiServerUrl: string;
  streamServerUrl?: string;
}

const authHandler: MiddlewareResponseHandler = defineMiddleware(
  async (context, next) => {
    const { cookies, url, locals } = context;

    const routeProps = getRouteProps(url);

    const { accessToken, connectionId } = await initAccessToken({
      cookies,
      routeProps,
      url: url.href,
    });

    locals.accessToken = accessToken;
    locals.connectionId = connectionId;

    return next();
  }
);

export const onRequest = sequence(authHandler);

const initAccessToken = async ({
  cookies,
  routeProps,
  url,
}: {
  cookies: AstroCookies;
  routeProps: RouteProps;
  url: string;
}) => {
  let refreshToken = cookies.get('refreshToken').value;
  let accessToken = cookies.get('accessToken').value;

  let deviceId;
  let sessionId;

  const connectionId = generateSnowflakeId();

  // If no refresh token, make one with
  // a fresh sessionId id and deviceId
  if (!refreshToken) {
    deviceId = generateSnowflakeId();
    sessionId = generateSnowflakeId();
    const refreshJwt = new jose.SignJWT({
      deviceId,
      sessionId,
    })
      .setProtectedHeader({ alg })
      .setSubject(connectionId)
      .setAudience('STRIKERS_GAME_WEB')
      .setExpirationTime('90d')
      .setIssuedAt()
      .setIssuer('STRIKERS_GAME_WEB');
    const secret = new TextEncoder().encode('my_private_key');
    refreshToken = await refreshJwt.sign(secret);

    cookies.set('refreshToken', refreshToken, {
      maxAge: 30 * 24 * 60 * 60, // 90 days
    });
    // Otherwise if refreshToken,
    // parse it, get the sessionId and deviceId and make
    // a new accessToken / connection
  } else {
    console.log({ refreshToken });
    // if the refresh token is expired, create a new one
    const parsed = JWT.verify(refreshToken, 'my_private_key', {
      audience: 'STRIKERS_GAME_WEB',
    });
    console.log({ parsed });
    assert(
      typeof parsed === 'object',
      'expected JWT parsed payload to be object'
    );

    deviceId = parsed.deviceId;
    sessionId = parsed.sessionId;

    assert(deviceId, "expected 'deviceId' from refreshToken");
    assert(sessionId, "expected 'sessionId' from refreshToken");

    // todo refresh the refresh token here
  }

  if (!accessToken) {
    const accessJwt = new jose.SignJWT({
      deviceId,
      sessionId,
      initialRouteProps: routeProps,
      url,
    })
      .setProtectedHeader({ alg })
      .setSubject(connectionId)
      .setExpirationTime('1d')
      .setIssuedAt()
      .setIssuer('STRIKERS_GAME_WEB');
    const secret = new TextEncoder().encode('my_private_key');
    accessToken = await accessJwt.sign(secret);

    cookies.set('accessToken', accessToken, {
      maxAge: 24 * 60 * 60, // 24 hours
    });

    const client = createTRPCProxyClient<ApiRouter>({
      transformer,
      links: [
        httpBatchLink({
          url: import.meta.env.PUBLIC_API_HTTP_SERVER_URL,
          async headers() {
            return {
              authorization: `Bearer ${accessToken}`,
              connectionId: connectionId,
            };
          },
        }),
      ],
    });

    // Send a first heartbeat over HTTP to create the
    // connection entity
    client.connection.heartbeat
      .mutate()
      .then(() => {
        // no-op for now
      })
      .catch((ex) => {
        console.error(ex);
      });
  }

  return { accessToken, connectionId };
};
