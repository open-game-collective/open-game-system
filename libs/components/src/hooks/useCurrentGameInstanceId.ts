import { ChannelContext } from '@organisms/channel/channel.context';
import { useContext } from 'react';
import { useEntitySelector } from './useEntitySelector';

/**
 * @returns The id of the current game instance in the current channel context
 */
export const useCurrentGameInstanceId = () => {
  const { roomEntity } = useContext(ChannelContext);
  return useEntitySelector(
    roomEntity,
    (entity) => entity.currentGameInstanceId
  );
};
