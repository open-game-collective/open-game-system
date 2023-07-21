import type { ChannelEvent, StartGameBlock } from '@explorers-club/schema';
import { useContext } from 'react';
import { BlockContext } from "@molecules/Blocks/block.context";
import { assert, assertType } from '@explorers-club/utils';

export const StrikersStartGameBlock = () => {
  const { block } = useContext(BlockContext);
  assertType(block, "StartGame");
  assert(block.gameId === "strikers", "expected block gameId to be strikers but wasnt");

  // console.log({ block, event });
  return <div>strikers start game block</div>;
};
