import { generateSnowflakeId } from '@api/ids';
import { RouteProps } from '@explorers-club/schema';
import { StrikersSceneManager } from './scene-manager';
// import * as JWT from 'jsonwebtoken';
import * as jose from 'jose';
import { generateRandomString } from '@explorers-club/utils';
import { ApiRouter } from '@api/index';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { transformer } from '@api/client';
import { useEffect, useState } from 'react';

const alg = 'HS256';

export default {
  component: StrikersSceneManager,
};

export const Default = {
  render: () => {
    const slug = generateRandomString();
    const [accessToken, setAccessToken] = useState<string | null>(null);
    useEffect(() => {
      (async () => {
        const accessToken = await initAccessToken(
          {
            name: 'Room',
            roomSlug: slug,
          },
          `http://localhost:3000/${slug}`
        );
        setAccessToken(accessToken);
      })();
    }, [setAccessToken]);
    console.log('token', accessToken);
    return <div>hello {accessToken}</div>;
  },
};

const initAccessToken = async (routeProps: RouteProps, url: string) => {
  const deviceId = generateSnowflakeId();
  const sessionId = generateSnowflakeId();

  const connectionId = generateSnowflakeId();

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

  const accessToken = await jwt.sign(secret);

  const client = createTRPCProxyClient<ApiRouter>({
    transformer,
    links: [
      httpBatchLink({
        url: 'http://127.0.0.1:3001/trpc',
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

  // Send a first heartbeat over HTTP to create the connection entity
  await client.connection.heartbeat.mutate();

  return accessToken;
};
