import { useContext } from 'react';
import { StrikersContext } from '../context/strikers.context';

export const useMyPlayerEntity = () => {
  const { playerEntity } = useContext(StrikersContext);
  return playerEntity;
};
