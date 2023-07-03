import type { AstroCookies } from 'astro';
import * as JWT from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import type { RouteProps } from '@schema/types';
import { ApiRouter, transformer } from '@explorers-club/api-client';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';

const client = createTRPCProxyClient<ApiRouter>({
  transformer,
  links: [
    httpBatchLink({
      url: import.meta.env.PUBLIC_API_HTTP_SERVER_URL,
      // You can pass any HTTP headers you wish here
      // async headers() {
      //   return {
      //     authorization: `Bearer ${refreshToken}`,
      //   };
      // },
    }),
  ],
});

export const initAccessToken = (
  cookies: AstroCookies,
  routeProps: RouteProps
) => {
  let deviceId = cookies.get('deviceId').value;
  let refreshToken = cookies.get('refreshToken').value;
  let accessToken = cookies.get('accessToken').value;

  if (!deviceId) {
    deviceId = randomUUID();
    cookies.set('deviceId', deviceId, {
      maxAge: 9999999999999,
    });
  }

  if (!refreshToken) {
    refreshToken = JWT.sign(
      {
        deviceId,
      },
      'my_private_key',
      {
        subject: randomUUID(),
        expiresIn: '30d',
        // issuer: 'explorers-game-web',
        jwtid: 'REFRESH_TOKEN',
      }
    );
    cookies.set('refreshToken', refreshToken, {
      maxAge: 30 * 24 * 60 * 60,
    });
  }

  if (!accessToken) {
    accessToken = JWT.sign(
      {
        deviceId,
      },
      'my_private_key',
      {
        subject: randomUUID(), // sessionId
        expiresIn: '1d',
        // issuer: 'explorers-game-web',
        jwtid: 'ACCESS_TOKEN',
      }
    );
    cookies.set('accessToken', accessToken, {
      maxAge: 24 * 60 * 60,
    });

    client.connection.initialize
      .mutate({
        deviceId,
        initialRouteProps: routeProps,
        accessToken,
      })
      .then(() => {
        // no-op for now
      })
      .catch((ex) => {
        console.error(ex);
      });
  }

  return accessToken;
};
