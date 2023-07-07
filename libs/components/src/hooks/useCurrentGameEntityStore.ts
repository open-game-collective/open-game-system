import { useCreateEntityStore } from '@hooks/useCreateEntityStore';
import { useEntityStoreSelector } from '@hooks/useEntityStoreSelector';
import { useCurrentChannelEntityStore } from './useCurrentChannelEntityStore';

export const useCurrentGameEntityStore = () => {
  const channelStore = useCurrentChannelEntityStore();
  const currentGameInstanceId = useEntityStoreSelector(
    channelStore,
    (entity) => entity.currentGameInstanceId
  );
  // console.log({ channelStore, currentGameInstanceId });

  return useCreateEntityStore(
    (entity) => {
      // console.log(
      //   'checking game query',
      //   entity.schema,
      //   entity.id,
      //   currentGameInstanceId
      // );
      return (currentGameInstanceId &&
        entity.id === currentGameInstanceId) as boolean;
    },
    [currentGameInstanceId]
  );
};
