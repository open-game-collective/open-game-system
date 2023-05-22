import { Box } from '@atoms/Box';
import { useStore } from '@nanostores/react';
import { NewRoomFlow } from '@organisms/new-room-flow';
import { Room } from '@organisms/room';
import { myInitializedConnectionEntityStore } from '@state/world';
import { currentRouteStore } from '../state/navigation';
import { InitializedConnectionEntityContext } from '@context/Entity';
import { createContext } from 'react';
import type { InitializedConnectionEntity } from '@explorers-club/schema';

export const MainPanel = () => {
  const currentRoute = useStore(currentRouteStore);

  return (
    <Box>
      {currentRoute === 'Home' && <HomePanel />}
      {currentRoute === 'NewRoom' && <NewRoomPanel />}
      {currentRoute === 'Room' && <RoomPanel />}
    </Box>
  );
};

const HomePanel = () => {
  return <div>Home</div>;
};

const NewRoomPanel = () => {
  const entity = useStore(myInitializedConnectionEntityStore);
  return entity ? (
    <InitializedConnectionEntityContext.Provider value={entity}>
      <NewRoomFlow />
    </InitializedConnectionEntityContext.Provider>
  ) : null;
};

const RoomPanel = () => {
  const entity = useStore(myInitializedConnectionEntityStore);
  return entity ? (
    <InitializedConnectionEntityContext.Provider value={entity}>
      <Room />
    </InitializedConnectionEntityContext.Provider>
  ) : null;
};
