import { assert, assertType } from '@explorers-club/utils';
import { useEntitySelector } from '@hooks/useEntitySelector';
import { BlockContext } from '@molecules/Blocks/block.context';
import { useCallback, useContext } from 'react';

export const StrikersStartGameBlock = () => {
  const { block, message, channelEntity } = useContext(BlockContext);
  assertType(block, 'StartGame');
  assert(
    block.gameId === 'strikers',
    'expected block gameId to be strikers but wasnt'
  );

  const disabled = useEntitySelector(
    channelEntity,
    (entity) => entity.allUserIds.length !== 2
  );

  const gameStarted = useEntitySelector(
    channelEntity,
    (entity) => !entity.currentGameInstanceId
  );

  const handleClick = useCallback(() => {
    channelEntity.send({
      type: 'START',
    });
  }, [channelEntity]);

  return gameStarted ? (
    <div>
      Start game when 2 players connected
      <button disabled={disabled} onClick={handleClick}>
        Start
      </button>
    </div>
  ) : (
    <div>Game started</div>
  );
};
