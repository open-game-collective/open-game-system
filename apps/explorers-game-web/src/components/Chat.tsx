import { useStore } from '@nanostores/react';
import { useEntitySelector } from '@hooks/useEntitySelector';
import { FC, ReactNode, useContext } from 'react';
import { isMainPanelFocusedStore } from '../state/layout';
import { myInitializedConnectionEntityStore } from '@state/world';
import { InitializedConnectionEntityContext } from '../../../../libs/components/src/context/Entity';

export const Chat = () => {
  const mainPanelFocused = useStore(isMainPanelFocusedStore);
  const entity = useStore(myInitializedConnectionEntityStore);

  if (mainPanelFocused) {
    return null;
  }

  if (!entity) {
    return <div>placeholder</div>;
  }

  return (
    <InitializedConnectionEntityContext.Provider value={entity}>
      <ChatComponent />
    </InitializedConnectionEntityContext.Provider>
  );
};

const ChatComponent = () => {
  const entity = useContext(InitializedConnectionEntityContext);
  const chatServiceValue = useEntitySelector(entity, (entity) => {
    return entity && entity.chatService?.value;
  });

  return <div>{chatServiceValue}</div>;
};
