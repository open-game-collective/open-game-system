import { Flex } from '@atoms/Flex';
import { Text } from '@atoms/Text';
import { useMyUserEntity } from '@hooks/useMyUserEntity';
import {
  BarNavigation,
  BarNavigationLeft,
  BarNavigationMain,
  BarNavigationRight,
} from '@molecules/BarNavigation';
import {
  Cross2Icon,
  DotFilledIcon,
  DotIcon,
  ThickArrowLeftIcon,
  TrackNextIcon,
} from '@radix-ui/react-icons';
import { useCurrentTurnEntity } from '@strikers/client/hooks/useCurrentTurnEntity';
import { useGameEntity } from '@strikers/client/hooks/useGameEntity';
// import { useMyPlayerEntity } from '@strikers/client/hooks/useCur';
import { IconButton } from '@atoms/IconButton';
import { StrikersTurnEntity } from '@explorers-club/schema';
import { useCurrentChannelEntityStore } from '@hooks/useCurrentChannelEntityStore';
import { useCurrentGameInstanceId } from '@hooks/useCurrentGameInstanceId';
import { useEntityStoreSelector } from '@hooks/useEntityStoreSelector';
import { StrikersProvider } from '@strikers/client/context/strikers.context';
import { map } from 'nanostores';
import { FC, useCallback, useState } from 'react';
import { useMyPlayerEntity } from '@strikers/client/hooks/useMyPlayerEntity';
import { isPlayersTurn } from '@strikers/utils';

const GameBottomBarNavigation = () => {
  const turnEntity = useCurrentTurnEntity();
  const myPlayerEntity = useMyPlayerEntity();
  const gameEntity = useGameEntity();

  if (!turnEntity || !myPlayerEntity) {
    return <></>;
  }

  const isMyTurn = isPlayersTurn(myPlayerEntity, gameEntity, turnEntity);
  return <>{isMyTurn && <MyTurnBarNavigation turnEntity={turnEntity} />}</>;
};

const MyTurnBarNavigation: FC<{ turnEntity: StrikersTurnEntity }> = ({
  turnEntity,
}) => {
  const [store] = useState(map({ isOpen: false }));
  const gameEntity = useGameEntity();

  return (
    <BarNavigation store={store}>
      <BarNavigationLeft>
        <IconButton size="3">
          <ThickArrowLeftIcon />
        </IconButton>
      </BarNavigationLeft>
      <BarNavigationMain>
        <Flex>
          <Text>Select player to move</Text>
        </Flex>
      </BarNavigationMain>
      <BarNavigationRight>
        <IconButton size="3">
          <Cross2Icon />
        </IconButton>
      </BarNavigationRight>
    </BarNavigation>
  );
};

export const BottomBarNavigation = () => {
  const currentGameInstanceId = useCurrentGameInstanceId();

  return (
    <Flex
      justify="start"
      align="center"
      gap="2"
      css={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        p: '$2',
        zIndex: 200,
      }}
    >
      {currentGameInstanceId ? (
        <StrikersProvider gameInstanceId={currentGameInstanceId}>
          <GameBottomBarNavigation />
        </StrikersProvider>
      ) : (
        <PreGameBottomBarNavigation />
      )}
    </Flex>
  );

  // return currentGameInstanceId ? (
  //   <StrikersProvider gameInstanceId={currentGameInstanceId}>
  //     <StrikersSceneManager gameInstanceId={currentGameInstanceId} />
  //   </StrikersProvider>
  // ) : (
  //   <></>
  // );
  // const gameEntity = useGameEntity();
  // const turnEntity = useCurrentTurnEntity();
  // const myPlayerEntity = useMyPlayerEntity();

  // console.log({ gameEntity, turnEntity });

  // // what are the example scenarios we have to have here?

  // // we would want to open the bottom bar
  // // generally if we are..
  // // 1. in the middle of a players turn
  // // 2. if they have selected a card and need to confirm it
  // // 3. in the confirm state

  // // so what are the states someone would go through when setting up their turn
  // // Movement Stage
  // //    events: MOVE_PLAYER,

  // //    each movement gets put in to a stack of operations
  // //    visualize all the moves on a map at once

  // //  in the bottom row, while you are doing
  // //    if a player is selected, the bottom row shows their remaining moves and stamina
  // //    if no player selected, show stamina tokens "Choose"

  // // -> Draw [2] stamina tokens.
  // // -> Move players
  // // -> Place all stamina tokens

  // // Action Stage
  // // Resolution Stage

  // const [machine] = useState(
  //   createMachine({
  //     id: 'BottomBarNavigation',
  //     states: {},
  //   })
  // );

  // const [store] = useState(
  //   map({
  //     isOpen: false,
  //   })
  // );

  // return (
  //   <Flex
  //     justify="start"
  //     align="center"
  //     gap="2"
  //     css={{
  //       position: 'absolute',
  //       background: 'white',
  //       borderRadius: '$2',
  //       border: '4px dashed yellow',
  //       bottom: '$2',
  //       left: '$2',
  //       right: '$2',
  //       p: '$2',
  //       zIndex: 200,
  //     }}
  //   >
  //     <BarNavigation store={store}>
  //       <PlayerSelectionBar />
  //     </BarNavigation>
  //   </Flex>
  // );
};

const PreGameBottomBarNavigation = () => {
  const userEntity = useMyUserEntity();
  const [store] = useState(map({ isOpen: false }));
  const currentChannel$ = useCurrentChannelEntityStore();
  const hostUserId = useEntityStoreSelector(
    currentChannel$,
    (entity) => entity.hostUserId
  );

  const handleClick = useCallback(() => {
    currentChannel$.get()?.send({
      type: 'START',
    });
  }, [currentChannel$]);

  return hostUserId === userEntity?.id ? (
    <BarNavigation store={store}>
      <BarNavigationRight>
        <IconButton size="3" onClick={handleClick}>
          <TrackNextIcon />
        </IconButton>
      </BarNavigationRight>
    </BarNavigation>
  ) : (
    <></>
  );
};

const PlayerSelectionBar = () => {
  return (
    <Flex css={{ flex: 1 }} direction="column">
      <Flex css={{ flex: 1 }}>
        <Flex css={{ flex: 1 }}>Alexander Schwab #13</Flex>
        <Flex css={{ gap: '$1', fontSize: '$2' }}>
          <Flex>END 7</Flex>
          <Flex>SPD A</Flex>
        </Flex>
      </Flex>
      <Flex>
        <DotFilledIcon />
        <DotFilledIcon />
        <DotFilledIcon />
        <DotFilledIcon />
        <DotIcon />
        <DotIcon />
      </Flex>
    </Flex>
  );
};
