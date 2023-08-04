import { ApiRouter, generateSnowflakeId, transformer } from '@api/client';
import { Card } from '@atoms/Card';
import { Flex } from '@atoms/Flex';
import { Grid } from '@atoms/Grid';
import { Heading } from '@atoms/Heading';
import type { Story } from '@storybook/react';
import type { RouteProps } from '@explorers-club/schema';
import { generateRandomString } from '@explorers-club/utils';
import type { StoryObj } from '@storybook/react';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import * as jose from 'jose';
import { FC, useEffect, useState } from 'react';
import { ApplicationProvider } from '@context/ApplicationProvider';
import { App } from './App';
import { envSchema } from '../env.schema';

const {
  PUBLIC_API_HTTP_SERVER_URL,
  PUBLIC_API_WS_SERVER_URL,
  PUBLIC_STRIKERS_GAME_WEB_URL,
} = envSchema.parse(process.env);

const RoomWrapper: FC<{ slug: string }> = (props) => {
  const { slug } = props;
  const routeProps = {
    name: 'Room',
    roomSlug: slug,
  } satisfies RouteProps;
  const [creds, setCreds] = useState<
    { connectionId: string; accessToken: string } | undefined
  >(undefined);

  useEffect(() => {
    (async () => {
      try {
        const creds = await initAccessToken(
          { name: 'Room', roomSlug: slug } satisfies RouteProps,
          `${PUBLIC_STRIKERS_GAME_WEB_URL}/${slug}`
        );
        setCreds(creds);
      } catch (ex) {
        console.error(ex);
      }
    })();
  }, [setCreds]);

  if (!creds) {
    return <></>;
  }

  const trpcUrl = `${PUBLIC_API_WS_SERVER_URL}/?accessToken=${creds.accessToken}`;

  return (
    <App
      initialRouteProps={routeProps}
      connectionId={creds.connectionId}
      trpcUrl={trpcUrl}
    />
  );
};

const meta = {
  title: 'App',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

// type Story = StoryObj<typeof meta>;

const fullPlayerInfo = [
  {
    name: 'Alice',
    userId: 'alice123',
  },
  {
    name: 'Bob',
    userId: 'bob123',
  },
  {
    name: 'Charlie',
    userId: 'charlie123',
  },
  {
    name: 'Dave',
    userId: 'dave123',
  },
  {
    name: 'Eve',
    userId: 'eve123',
  },
  {
    name: 'Frank',
    userId: 'frank123',
  },
  {
    name: 'Grace',
    userId: 'grace123',
  },
  {
    name: 'Heidi',
    userId: 'heidi123',
  },
];

const Template: Story<{
  numPlayers: number;
}> = ({ numPlayers }) => {
  const [initialized, setInitialized] = useState(false);
  const [slug] = useState(`test-${generateRandomString()}`);
  const [playerInfo] = useState(fullPlayerInfo.slice(0, numPlayers));

  useEffect(() => {
    (async () => {
      setInitialized(true);
    })();
  }, [setInitialized, playerInfo, slug]);

  return initialized ? (
    <Grid
      css={{
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gridAutoRows: '700px',
        border: '4px dashed red',
      }}
    >
      {playerInfo.map(({ userId, name }, index) => (
        <Flex
          key={userId}
          direction="column"
          css={{
            background: '$neutral1',
            width: '100%',
            position: 'relative',
            border: '4px dashed orange',
            // overflow: 'auto',
          }}
        >
          <RoomWrapper slug={slug} />
        </Flex>
      ))}
    </Grid>
  ) : (
    <Card css={{ p: '$3' }}>
      <Heading>Loading...</Heading>
    </Card>
  );
};

export const TwoPlayer = Template.bind({});
TwoPlayer.args = {
  numPlayers: 2,
};

export const ThreePlayer = Template.bind({});
ThreePlayer.args = {
  numPlayers: 3,
};

export const FourPlayer = Template.bind({});
FourPlayer.args = {
  numPlayers: 4,
};

export const FivePlayer = Template.bind({});
FivePlayer.args = {
  numPlayers: 5,
};

export const SixPlayer = Template.bind({});
SixPlayer.args = {
  numPlayers: 6,
};

export const SevenPlayer = Template.bind({});
SevenPlayer.args = {
  numPlayers: 7,
};

export const EightPlayer = Template.bind({});
EightPlayer.args = {
  numPlayers: 8,
};

const alg = 'HS256';

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

  // If port specified, assume no http

  const client = createTRPCProxyClient<ApiRouter>({
    transformer,
    links: [
      httpBatchLink({
        url: 'http://localhost:4400/trpc',
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

  return { accessToken, connectionId };
};
