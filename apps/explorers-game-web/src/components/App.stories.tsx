import { App } from './App';
// import { Flex } from '@atoms/Flex';

export default {
  title: 'App',
};

export const SinglePlayer = () => {
  return (
    <Flex>
      <Player />
    </Flex>
  );
};

const PlayerView = () => {
  return <div>Player</div>;
};
