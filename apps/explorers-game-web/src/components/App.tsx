import { Box } from '@atoms/Box';
import { Flex } from '@atoms/Flex';
import type { RouteProps } from '@explorers-club/schema';
import { useStore } from '@nanostores/react';
import type { FC } from 'react';
import { useIsomorphicLayoutEffect } from 'usehooks-ts';
import { Header } from '../components/Header';
import { isMainSceneFocusedStore } from '../state/layout';
import { currentRouteStore } from '../state/navigation';
import { MainScene } from './MainScene';
import { Menu } from './Menu';
import { Modal } from './Modal';
import { MainPanel } from './MainPanel';
import { Chat } from './Chat';

interface Props {
  initialRouteProps: RouteProps;
}

export const App: FC<Props> = ({ initialRouteProps }) => {
  useIsomorphicLayoutEffect(() => {
    currentRouteStore.set(initialRouteProps.name);
  }, []);

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
      <Modal />
    </Flex>
  );
};

// export const;

const MainUI = () => {
  // const isMainPanelFocued = useStore(isMainPanelFocusedStore);
  const isMainSceneFocused = useStore(isMainSceneFocusedStore);

  return (
    <Flex
      direction="column"
      css={{
        background: 'blue',
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
      <Chat />
    </Flex>
  );

  // const isFocusMainScreen = useServiceSelector('appService', (state) =>
  //   state.matches('Focus.MainScreen')
  // );

  // return (
  //   <Flex
  //     css={{
  //       background: 'white',
  //       width: '100%',
  //       flexShrink: 3,
  //       flexGrow: isMainPanelFocued ? 1 : 0,

  //       '@bp2': {
  //         ...(!isMainPanelFocued
  //           ? {
  //               position: 'absolute',
  //               right: '$3',
  //               bottom: '$3',
  //               maxWidth: '30%',
  //             }
  //           : {
  //               height: '100%',
  //               flexBasis: '30%',
  //               flexGrow: 1,
  //             }),
  //       },
  //     }}
  //   >
  //     <MainPanel />
  //     <Chat />
  //   </Flex>
  // );
};
