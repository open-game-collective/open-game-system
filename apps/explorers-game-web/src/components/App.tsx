import { Flex } from '@atoms/Flex';
import type { RouteProps } from '@explorers-club/schema';
import { styled } from '@explorers-club/styles';
import { useCurrentChannelEntityStore } from '@hooks/useCurrentChannelEntityStore';
import { useMyUserEntityStore } from '@hooks/useMyUserEntityStore';
import { useStore } from '@nanostores/react';
import { Chat, ChatContext } from '@organisms/Chat';
import { FC, useContext } from 'react';
import { TopNav } from './TopNav';
import { ApplicationContext } from '@context/ApplicationContext';
import { LayoutContext } from '@context/LayoutContext';
import { WorldContext } from '@context/WorldProvider';
import { RoutePanel } from './RoutePanel';
import { ScenePanel } from './ScenePanel';
import { Menu } from './Menu';
import { ChannelListDialog } from './ChannelListDialog';

interface Props {
  initialRouteProps: RouteProps;
}

const AppContainer = styled('div', {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  border: '4px dashed green',
  display: 'flex',
  flexDirection: 'column',
});

export const App: FC<Props> = ({ initialRouteProps }) => {
  const { routeStore } = useContext(ApplicationContext);
  routeStore.set(initialRouteProps);

  return (
    <AppContainer>
      <ScenePanel />
      <Menu />
      <ChannelListDialog />
      <MainPanel />
      {/* <Modal /> */}
    </AppContainer>
  );
};

const MainPanel = () => {
  const { isMainPanelFocusedStore } = useContext(LayoutContext);
  const isMainPanelFocused = useStore(isMainPanelFocusedStore);

  return (
    <Flex
      direction="column"
      css={{
        width: '100%',
        border: '4px dashed blue',
        height: isMainPanelFocused ? '50%' : '80%',
        flexBasis: '50%',
        // flexGrow: isMainSceneFocused ? 1 : 0,

        // '@bp2': {
        //   ...(!isMainSceneFocused
        //     ? {
        //         position: 'absolute',
        //         right: '$3',
        //         bottom: '$3',
        //         maxWidth: '30%',
        //       }
        //     : {
        //         height: '100%',
        //         flexBasis: '30%',
        //         flexGrow: 1,
        //       }),
        // },
      }}
    >
      {/* <MainPanel /> */}
      <RoutePanel />
      <ChatPanel />
    </Flex>
  );
};

const ChatPanel = () => {
  const { isMainPanelFocusedStore } = useContext(LayoutContext);
  const mainPanelFocused = useStore(isMainPanelFocusedStore);
  const { entityStoreRegistry } = useContext(WorldContext);
  const connectionEntity = useStore(entityStoreRegistry.myConnectionEntity);
  const roomEntityStore = useCurrentChannelEntityStore();
  const roomEntity = useStore(roomEntityStore);
  const userEntityStore = useMyUserEntityStore();
  const userEntity = useStore(userEntityStore);

  if (mainPanelFocused) {
    return null;
  }

  if (!userEntity) {
    return <div>Authenticating</div>;
  }

  if (!connectionEntity) {
    return <div>Connecting</div>;
  }

  if (!roomEntity) {
    return <div>Finding Room</div>;
  }

  return (
    <ChatContext.Provider value={{ roomEntity, connectionEntity, userEntity }}>
      <Chat />
    </ChatContext.Provider>
  );
};
