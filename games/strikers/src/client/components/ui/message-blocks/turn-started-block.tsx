import { assertType } from '@explorers-club/utils';
import { BlockContext } from '@molecules/Blocks/block.context';
import { useContext } from 'react';

export const TurnStartedBlock = () => {
  const { block } = useContext(BlockContext);
  assertType(block, 'TurnStarted');

  return (
    // Replace with your component logic
    <div>{block.turnId} started turn</div>
  );
};
