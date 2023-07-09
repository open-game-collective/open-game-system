import type {
  SnowflakeId,
  StrikersGameEntity,
  StrikersPlayerEntity,
} from '@explorers-club/schema';
import { assertEntitySchema } from '@explorers-club/utils';
import { useCreateEntityStore } from '@hooks/useCreateEntityStore';
import { useStore } from '@nanostores/react';
import { FC, createContext } from 'react';

const StrikersContext = createContext({
  gameEntity: {} as StrikersGameEntity,
  playerEntity: {} as StrikersPlayerEntity | undefined,
});

export const StrikersSceneManager: FC<{
  gameInstanceId: SnowflakeId;
}> = ({ gameInstanceId }) => {
  const gameEntityStore = useCreateEntityStore<StrikersGameEntity>(
    (entity) => {
      return entity.id === gameInstanceId;
    },
    [gameInstanceId]
  );

  const gameEntity = useStore(gameEntityStore);
  if (!gameEntity) {
    return <></>;
  }

  assertEntitySchema(gameEntity, 'strikers_game');

  return (
    <StrikersContext.Provider value={{ gameEntity, playerEntity: undefined }}>
      <StrikersGameScene />
    </StrikersContext.Provider>
  );
};

export const StrikersGameScene = () => {
  return (
    <mesh rotation={[10, 10, 0]}>
      <boxBufferGeometry attach="geometry" args={[2, 2, 2]} />
      <meshStandardMaterial attach="material" color={0xcc0000} />
    </mesh>
  );
};
