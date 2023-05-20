import { ConnectionEntity, SnowflakeId } from '@explorers-club/schema';
import { useStore } from '@nanostores/react';
import { useEntities } from '@miniplex/react';
import { FC, useState } from 'react';
import { useEntitySelector } from '../../hooks/useEntitySelector';
import { worldStore } from '../../state/world';
import { With } from 'miniplex';

type GameListServiceEntity = With<ConnectionEntity, 'gameListService'>;

export const GameList = () => {
  const world = useStore(worldStore);
  // const [query] = useState(world.archetype<NewRoomState>("newRoomState"));
  const [archetype] = useState(
    world.with<GameListServiceEntity>('gameListService')
  );
  const bucket = useEntities(archetype);

  const entity = bucket.entities.length && bucket.entities[0];
  if (!entity) {
    return <div>Loading</div>;
  }

  return <ContestListComponent entityId={entity.id} />;
};

const ContestListComponent: FC<{ entityId: SnowflakeId }> = ({ entityId }) => {
  const stateValue = useEntitySelector<GameListServiceEntity>(
    entityId,
    (state) => state.gameListService.value
  );

  const states = useEntitySelector<GameListServiceEntity>(
    entityId,
    (state) => state.states
  );
  console.log({ states, stateValue });

  return <></>;
};
