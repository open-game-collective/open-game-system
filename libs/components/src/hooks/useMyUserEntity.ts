import { useStore } from '@nanostores/react';
import { useMyUserEntityStore } from './useMyUserEntityStore';

export const useMyUserEntity = () => {
  const myUserEntity$ = useMyUserEntityStore();
  return useStore(myUserEntity$);
};
