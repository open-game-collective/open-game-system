import type { RouteProps } from '@explorers-club/schema';
import type { FC } from 'react';
import { useIsomorphicLayoutEffect } from 'usehooks-ts';
import { ChatContainer } from '../components/ChatContainer';
import { Header } from '../components/Header';
import { MainPanelContainer } from '../components/MainPanelContainer';
import { MainSceneContainer } from '../components/MainSceneContainer';
import { ModalContainer } from '../components/ModalContainer';
import { currentRouteStore } from '../state/navigation';
import { Menu } from './Menu';

interface Props {
  initialRouteProps: RouteProps;
}

export const App: FC<Props> = ({ initialRouteProps }) => {
  useIsomorphicLayoutEffect(() => {
    currentRouteStore.set(initialRouteProps.name);
  }, []);

  return (
    <>
      <Header />
      <Menu />
      <MainPanelContainer>
        <slot name="MainPanel" />
      </MainPanelContainer>
      <MainSceneContainer>
        <slot name="MainScene" />
      </MainSceneContainer>
      <ChatContainer>
        <slot name="Chat" />
      </ChatContainer>
      <ModalContainer>
        <slot name="Modal" />
      </ModalContainer>
    </>
  );
};
