import { Card } from '@atoms/Card';
import { Flex } from '@atoms/Flex';
import { Grid } from '@atoms/Grid';
import { Heading } from '@atoms/Heading';
import { ApplicationProvider } from './ApplicationProvider';
import type { RouteProps } from '@explorers-club/schema';
import { generateRandomString } from '@explorers-club/utils';
import type { Meta, Story } from '@storybook/react';
import { FC, useEffect, useState } from 'react';
// import { App } from "../components/App";

const meta = {
  title: 'App',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

// type Story = StoryObj<typeof meta>;

const RoomWrapper: FC<{ slug: string; myUserId: string }> = (props) => {
  const { slug, myUserId } = props;
  // const [store, setStore] = useState<LittleVigilanteStore | null>(null);
  // const [event$] = useState<Subject<LittleVigilanteServerEvent>>(new Subject());

  // useEffect(() => {
  //   joinAndCreateStore(roomId, myUserId, event$)
  //     .then(setStore)
  //     .catch(console.error);
  // }, [roomId, myUserId, setStore, event$]);

  // if (!store) {
  // eslint-disable-next-line react/jsx-no-useless-fragment
  //   return <></>;
  // }
  const routeProps = {
    name: 'Room',
    roomSlug: slug,
  } satisfies RouteProps;

  return (
    <ApplicationProvider
      trpcUrl={'ws://localhost:3001'}
      initialRouteProps={routeProps}
      initialPersistentProps={{
        refreshToken: undefined,
        accessToken: undefined,
        deviceId: undefined,
      }}
    />
  );

  {
    /* return (
    <LittleVigilanteContext.Provider
      value={{ store, myUserId, event$, gameId: roomId }}
    >
      <ChatServiceProvider>
        <Flex direction="column" css={{ width: '100%', minHeight: '100%' }}>
          <LittleVigilanteRoomComponent />
        </Flex>
      </ChatServiceProvider>
    </LittleVigilanteContext.Provider>
  ); */
  }
};

const Template: Story<{
  numPlayers: number;
}> = ({ numPlayers }) => {
  const [initialized, setInitialized] = useState(false);
  const [slug] = useState(`test-${generateRandomString()}`);
  const [playerInfo] = useState(fullPlayerInfo.slice(0, numPlayers));

  useEffect(() => {
    (async () => {
      // const colyseusClient = new Colyseus.Client('ws://localhost:2567');
      // let room: Room<LittleVigilanteState>;
      // const options: OnCreateOptions = {
      //   roomId,
      //   playerInfo,
      //   votingTimeSeconds,
      //   discussionTimeSeconds,
      //   roundsToPlay: 3,
      //   rolesToExclude: ['butler'],
      // };
      // try {
      //   room = await colyseusClient.create<LittleVigilanteState>(
      //     'little_vigilante',
      //     options
      //   );
      //   room.onMessage('*', (event: LittleVigilanteServerEvent) => {
      //     // just a no-op so we don't get warnings logs
      //   });
      // } catch (ex) {
      //   console.error(ex);
      //   return;
      // }
      // await new Promise((resolve) => room.onStateChange.once(resolve));
      setInitialized(true);
    })();
  }, [setInitialized, playerInfo, slug]);

  return initialized ? (
    <Grid
      css={{
        // height: '100vh',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
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
          <RoomWrapper slug={slug} myUserId={userId} />
        </Flex>
      ))}
    </Grid>
  ) : (
    <Card css={{ p: '$3' }}>
      <Heading>Loading...</Heading>
    </Card>
  );
};

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
