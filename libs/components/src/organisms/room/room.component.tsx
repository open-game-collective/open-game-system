import { InitializedConnectionEntityContext } from '../../context/Entity';
import { enablePatches } from 'immer';
import { useContext } from 'react';
enablePatches();

export const Room = () => {
  const connectionEntity = useContext(InitializedConnectionEntityContext);
  console.log({ connectionEntity });

  return <div>room</div>;
};
