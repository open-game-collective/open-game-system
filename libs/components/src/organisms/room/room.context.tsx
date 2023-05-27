import { ConnectionEntity, RoomEntity } from '@explorers-club/schema';
import { createContext } from 'react';

export const RoomContext = createContext(
  {} as {
    connectionEntity: ConnectionEntity | null;
    roomEntity: RoomEntity | null;
  }
);
