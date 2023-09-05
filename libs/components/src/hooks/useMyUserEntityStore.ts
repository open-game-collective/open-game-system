import type { UserEntity } from '@explorers-club/schema';
import { useCreateEntityStore } from '@hooks/useCreateEntityStore';
import { useMyUserId } from './useMyUserId';

export const useMyUserEntityStore = () => {
  const myUserId = useMyUserId();

  return useCreateEntityStore<UserEntity>(
    (entity) => {
      return (myUserId && entity.id === myUserId) as boolean;
    },
    [myUserId]
  );
};
