import { generateSnowflakeId } from '@api/ids';
import * as jose from 'jose';
import type { RouteProps } from '@schema/types';
import type { AstroCookies, MiddlewareResponseHandler } from 'astro';
import { defineMiddleware, sequence } from 'astro/middleware';
import { getRouteProps } from './routing';
import type { ApiRouter } from '@api/index';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { transformer } from '@api/transformer';

const alg = 'HS256';

const authHandler: MiddlewareResponseHandler = defineMiddleware(
  async (context, next) => {
    const { cookies, url, locals } = context;

    const routeProps = getRouteProps(url);

    const { accessToken, connectionId } = await initAccessToken(
      cookies,
      routeProps,
      url.href
    );

    locals.accessToken = accessToken;
    locals.connectionId = connectionId;

    return next();
  }
);

// export const onRequest: MiddlewareResponseHandler = (context, next) => {
//   const { cookies, url, locals } = context;
//   const routeProps = getRouteProps(url);
//   console.log({ routeProps });

//   let deviceId = cookies.get('deviceId').value;
//   let sessionId = cookies.get('sessionId').value;
//   let accessToken = cookies.get('accessToken').value;

//   console.log({ deviceId });
//   if (!deviceId) {
//     deviceId = generateSnowflakeId();
//     cookies.set('deviceId', deviceId, {
//       maxAge: 99999999999999,
//     });
//   }
//   console.log({ deviceId });

//   if (!sessionId) {
//     sessionId = generateSnowflakeId();
//     cookies.set('sessionId', sessionId, {
//       maxAge: 30 * 24 * 60 * 60, // 30 days
//     });
//   }
//   console.log({ sessionId });

//   const { accessToken, connectionId } = initAccessToken(
//     cookies,
//     routeProps,
//     url.href
//   );
//   console.log({ accessToken, connectionId });

//   locals.accessToken = accessToken;
//   locals.connectionId = connectionId;

//   return next();
// };

export const onRequest = sequence(authHandler);

const initAccessToken = async (
  cookies: AstroCookies,
  routeProps: RouteProps,
  url: string
) => {
  let deviceId = cookies.get('deviceId').value;
  let sessionId = cookies.get('sessionId').value;
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

  // if (!accessToken) {
  //   accessToken = '';
  // }

  if (!accessToken) {
    // const payload = {
    //   deviceId,
    //   sessionId,
    //   initialRouteProps: routeProps,
    //   url,
    //   jwtid: 'ACCESS_TOKEN', // JWT ID
    //   sub: connectionId, // Subject
    // };
    // const secret = 'my_private_key'; // You should store this securely
    // accessToken = jwt.encode(payload, secret, undefined, {
    //   header: {
    //     exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // Expires in 1 day
    //     iss: 'explorers-game-web', // Issuer
    //   },
    // });
    const jwt = new jose.SignJWT({
      deviceId,
      sessionId,
      initialRouteProps: routeProps,
      url,
    })
      .setProtectedHeader({ alg })
      .setSubject(connectionId)
      .setExpirationTime('1d')
      .setJti('ACCESS_TOKEN')
      .setIssuer('STORYBOOK');
    const secret = new TextEncoder().encode('my_private_key');
    accessToken = await jwt.sign(secret);

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
