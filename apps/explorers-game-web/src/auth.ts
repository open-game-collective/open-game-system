import type { AstroCookies } from 'astro';
import * as JWT from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import type { ConnectionAccessTokenProps, RouteProps } from '@schema/types';
import {
  ApiRouter,
  transformer,
  generateSnowflakeId,
} from '@explorers-club/api-client';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';

export const initAccessToken = (
  cookies: AstroCookies,
  routeProps: RouteProps,
  url: string
) => {
  let deviceId = cookies.get('deviceId').value;
  let sessionId = cookies.get('sessionId').value;
  // let refreshToken = cookies.get('refreshToken').value;
  let accessToken = cookies.get('accessToken').value;

  if (!deviceId) {
    deviceId = generateSnowflakeId();
    cookies.set('deviceId', deviceId, {
      maxAge: 99999999999999,
    });
  }

  if (!sessionId) {
    sessionId = generateSnowflakeId();
    cookies.set('sessionId', sessionId, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
  }

  const connectionId = generateSnowflakeId();

  if (!accessToken) {
    accessToken = JWT.sign(
      {
        deviceId,
        sessionId,
        initialRouteProps: routeProps,
        url,
      } satisfies Omit<ConnectionAccessTokenProps, 'sub'>,
      'my_private_key',
      {
        subject: connectionId,
        expiresIn: '1d',
        issuer: 'explorers-game-web',
        jwtid: 'ACCESS_TOKEN',
      }
    );

    cookies.set('accessToken', accessToken, {
      maxAge: 24 * 60 * 60, // 24 hours
    });

    const client = createTRPCProxyClient<ApiRouter>({
      transformer,
      links: [
        httpBatchLink({
          url: import.meta.env.PUBLIC_API_HTTP_SERVER_URL,
          // You can pass any HTTP headers you wish here
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

// todo do we still need refreshToken now? when?

// if (!refreshToken) {
//   refreshToken = JWT.sign(
//     {
//       deviceId,
//     },
//     'my_private_key',
//     {
//       subject: randomUUID(),
//       expiresIn: '30d',
//       // issuer: 'explorers-game-web',
//       jwtid: 'REFRESH_TOKEN',
//     }
//   );
//   cookies.set('refreshToken', refreshToken, {
//     maxAge: 30 * 24 * 60 * 60,
//   });
// }
