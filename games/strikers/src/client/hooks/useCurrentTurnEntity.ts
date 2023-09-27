import {
  useEntitySelector,
  useEntitySelectorDeepEqual,
} from '@hooks/useEntitySelector';
import { useGameEntity } from './useGameEntity';
import { useCreateEntityStore } from '@hooks/useCreateEntityStore';
import { useStore } from '@nanostores/react';
import { StrikersTurnEntity } from '@explorers-club/schema';

export const useCurrentTurnEntity = () => {
  const gameEntity = useGameEntity();

  const turnIds = useEntitySelectorDeepEqual(
    gameEntity,
    (entity) => entity.turnsIds
  );
  const turnId = turnIds[turnIds.length - 1];

  const turnEntityStore = useCreateEntityStore<StrikersTurnEntity>(
    (query) => query.id === turnId,
    [turnId]
  );

  return useStore(turnEntityStore);
};
