import { useCreateEntityStore } from '@hooks/useCreateEntityStore';
import { MessageChannelEntity } from '@schema/types';
import { ReadableAtom } from 'nanostores';
import { useCurrentChannelId } from './useCurrentChannelId';

export const useCurrentMessageChannelEntityStore = () => {
  const currentChannelId = useCurrentChannelId();

  return useCreateEntityStore(
    (entity) => {
      return (currentChannelId &&
        entity.schema === 'message_channel' &&
        entity.channelId === currentChannelId) as boolean;
    },
    [currentChannelId]
  ) as ReadableAtom<MessageChannelEntity | null>;
};
