import {
  ConnectionEntity,
  RoomEntity,
  UserEntity,
} from '@explorers-club/schema';
import { createContext } from 'react';

export const ChatContext = createContext(
  {} as {
    connectionEntity: ConnectionEntity;
    userEntity: UserEntity;
    roomEntity: RoomEntity;
    // channelId: SnowflakeId;
  }
);
