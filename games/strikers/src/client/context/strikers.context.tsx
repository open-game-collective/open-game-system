import { useCreateEntityStore } from '@hooks/useCreateEntityStore';
import { useMyUserId } from '@hooks/useMyUserId';
import { useStore } from '@nanostores/react';
import {
  SnowflakeId,
  StrikersGameEntity,
  StrikersPlayerEntity,
} from '@schema/types';
import { FC, ReactNode, createContext } from 'react';

export const StrikersContext = createContext({
  gameEntity: {} as StrikersGameEntity,
  playerEntity: {} as StrikersPlayerEntity | null,
});

export const StrikersProvider: FC<{
  children: ReactNode;
  gameInstanceId: SnowflakeId;
}> = ({ gameInstanceId, children }) => {
  const currentUserId = useMyUserId();
  const gameEntityStore = useCreateEntityStore<StrikersGameEntity>(
    (entity) => {
      return entity.id === gameInstanceId;
    },
    [gameInstanceId]
  );
  const playerEntityStore = useCreateEntityStore<StrikersPlayerEntity>(
    (entity) => {
      return (
        entity.schema === 'strikers_player' && entity.userId === currentUserId
      );
    },
    [currentUserId]
  );

  const gameEntity = useStore(gameEntityStore);
  const playerEntity = useStore(playerEntityStore);
  if (!gameEntity) {
    return <></>;
  }

  return (
    <StrikersContext.Provider value={{ gameEntity, playerEntity }}>
      {children}
    </StrikersContext.Provider>
  );
};
