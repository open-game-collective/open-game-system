import { useContext } from 'react';
import { StrikersContext } from '../context/strikers.context';

export const useGameEntity = () => {
  const { gameEntity } = useContext(StrikersContext);
  return gameEntity;
};
