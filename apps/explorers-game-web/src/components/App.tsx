import { Flex } from '@atoms/Flex';
import type { RouteProps } from '@explorers-club/schema';
import { styled } from '@explorers-club/styles';
import { useCurrentRoomEntityStore } from '@hooks/useCurrentRoomEntityStore';
import { useStore } from '@nanostores/react';
import { Chat, ChatContext } from '@organisms/Chat';
import { FC, useContext } from 'react';
import { Header } from '../components/Header';
// import {
//   isMainPanelFocusedStore,
//   isMainSceneFocusedStore,
// } from '../global/layout';
// import { currentRouteStore } from '../global/navigation';
import { ApplicationContext } from '@context/ApplicationContext';
import { LayoutContext } from '@context/LayoutContext';
import { WorldContext } from '@context/WorldProvider';
import { MainPanel } from './MainPanel';
import { MainScene } from './MainScene';
import { Menu } from './Menu';

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
  display: "flex",
  flexDirection: 'column',
});

export const App: FC<Props> = ({ initialRouteProps }) => {
  const { routeStore } = useContext(ApplicationContext);
  // routeStore.set(initialRouteProps);

  return (
    <AppContainer>
      {/* <Header /> */}
      {/* <Menu /> */}
      <MainScene />
      {/* <MainUI /> */}
      {/* <Modal /> */}
    </AppContainer>
  );
};

const MainUI = () => {
  const { isMainPanelFocusedStore } = useContext(LayoutContext);
  const isMainPanelFocused = useStore(isMainPanelFocusedStore);

  return (
    <Flex
      direction="column"
      css={{
        // background: 'white',
        width: '100%',
        // flexShrink: 3,
        border: '4px dashed blue',
        position: 'absolute',
        bottom: 0,
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
      <MainPanel />
      <ChatPanel />
    </Flex>
  );
};

const ChatPanel = () => {
  const { isMainPanelFocusedStore } = useContext(LayoutContext);
  const mainPanelFocused = useStore(isMainPanelFocusedStore);
  const { entityStoreRegistry } = useContext(WorldContext);
  const connectionEntity = useStore(
    entityStoreRegistry.myInitializedConnectionEntity
  );
  const roomEntityStore = useCurrentRoomEntityStore();
  const roomEntity = useStore(roomEntityStore);

  if (mainPanelFocused) {
    return null;
  }

  if (!connectionEntity || !roomEntity) {
    return <div>placeholder</div>;
  }

  return (
    <ChatContext.Provider value={{ connectionEntity, roomEntity }}>
      <Chat />
    </ChatContext.Provider>
  );
};
