import { Flex } from '@atoms/Flex';
import type { RouteProps } from '@explorers-club/schema';
import { useCurrentRoomEntityStore } from '@hooks/useCurrentRoomEntityStore';
import { useStore } from '@nanostores/react';
import { Chat, ChatContext } from '@organisms/Chat';
import { myInitializedConnectionEntityStore } from '@state/world';
import type { FC } from 'react';
import { Header } from '../components/Header';
import {
  isMainPanelFocusedStore,
  isMainSceneFocusedStore,
} from '../state/layout';
import { currentRouteStore } from '../state/navigation';
import { MainPanel } from './MainPanel';
import { MainScene } from './MainScene';
import { Menu } from './Menu';

interface Props {
  initialRouteProps: RouteProps;
}

export const App: FC<Props> = ({ initialRouteProps }) => {
  currentRouteStore.set(initialRouteProps.name);

  return (
    <Flex
      css={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'column',

        '@bp2': {
          flexDirection: 'row',
        },
      }}
    >
      <Header />
      <Menu />
      <MainScene />
      <MainUI />
      {/* <Modal /> */}
    </Flex>
  );
};

const MainUI = () => {
  const isMainSceneFocused = useStore(isMainSceneFocusedStore);
  // const isMainPanelFocused = useStore(isMainPanelFocusedStore);

  return (
    <Flex
      direction="column"
      css={{
        background: 'white',
        width: '100%',
        flexShrink: 3,
        flexGrow: isMainSceneFocused ? 1 : 0,

        '@bp2': {
          ...(!isMainSceneFocused
            ? {
                position: 'absolute',
                right: '$3',
                bottom: '$3',
                maxWidth: '30%',
              }
            : {
                height: '100%',
                flexBasis: '30%',
                flexGrow: 1,
              }),
        },
      }}
    >
      <MainPanel />
      <ChatPanel />
    </Flex>
  );
};

const ChatPanel = () => {
  const mainPanelFocused = useStore(isMainPanelFocusedStore);
  const connectionEntity = useStore(myInitializedConnectionEntityStore);
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
