import type { ChannelEntity } from '@explorers-club/schema';
import { useCreateEntityStore } from '@hooks/useCreateEntityStore';
import { useCurrentChannelId } from './useCurrentChannelId';

export const useCurrentChannelEntityStore = () => {
  const currentChannelId = useCurrentChannelId();

  return useCreateEntityStore<ChannelEntity>(
    (entity) => {
      return (currentChannelId && entity.id === currentChannelId) as boolean;
    },
    [currentChannelId]
  );
};
