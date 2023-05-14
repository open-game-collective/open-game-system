import { useStore } from '@nanostores/react';
import { worldStore } from '@state/world';

export const NewRoomFlow = () => {
  const world = useStore(worldStore);
  console.log(world);

  return <div>New Room Flow</div>;
};
