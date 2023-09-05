import { Box } from '@atoms/Box';
import { Text } from '@atoms/Text';
import { Button } from '@atoms/Button';
import { Caption } from '@atoms/Caption';
import { Card } from '@atoms/Card';
import { Flex } from '@atoms/Flex';
import { Heading } from '@atoms/Heading';
import { IconButton } from '@atoms/IconButton';
import { ScrollAreaRoot } from '@atoms/ScrollArea';
import { LayoutContext } from '@context/LayoutContext';
import { WorldContext } from '@context/WorldProvider';
import { trpc } from '@explorers-club/api-client';
import type { StreamEntity, UserEntity } from '@explorers-club/schema';
import { styled } from '@explorers-club/styles';
import { assert, isMobileDevice } from '@explorers-club/utils';
import { useEntityIdProp } from '@hooks/useEntityIdProp';
import {
  useEntitySelector,
  useEntitySelectorDeepEqual,
} from '@hooks/useEntitySelector';
import { useMyUserEntity } from '@hooks/useMyUserEntity';
import { useStore } from '@nanostores/react';
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import {
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from '@radix-ui/react-scroll-area';
import * as Tabs from '@radix-ui/react-tabs';
import { map } from 'nanostores';
import {
  FC,
  ForwardedRef,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useCurrentChannelId } from '@hooks/useCurrentChannelId';

export const Menu = () => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const { isMenuOpenStore } = useContext(LayoutContext);
  const isOpen = useStore(isMenuOpenStore);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        isMenuOpenStore.set(false);
      }
    },
    [isMenuOpenStore]
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal container={container}>
        <MenuDrawerOverlay />
        <MenuDrawerContent />
      </Dialog.Portal>
      <ModalContainer ref={setContainer} />
    </Dialog.Root>
  );
};

const ModalContainer = forwardRef((_, ref: ForwardedRef<HTMLDivElement>) => {
  const { isMenuOpenStore } = useContext(LayoutContext);
  const isOpen = useStore(isMenuOpenStore);

  return (
    <Box
      ref={ref}
      css={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        zIndex: isOpen ? 1000 : -9999,
      }}
    />
  );
});

const StyledDialogContent = styled(Dialog.Content, {
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  right: 0,
  background: '$primary3',
});

const TabButton = styled(Button, {
  "&[data-state='active']": {
    background: '$primary4',
  },
});
// .TabsTrigger[data-state='active'] {
//   color: var(--violet11);
//   box-shadow: inset 0 -1px 0 0 currentColor, 0 1px 0 0 currentColor;
// }

const defaultMenu$ = map({
  userEntity: {} as UserEntity,
});

const MenuContext = createContext({} as typeof defaultMenu$);

const MenuDrawerContent = () => {
  const userEntity = useMyUserEntity();
  if (!userEntity) {
    return <>Loading</>;
  }

  const [menuContext$] = useState(
    map({
      userEntity,
    })
  );

  return (
    <MenuContext.Provider value={menuContext$}>
      <StyledDialogContent>
        <Tabs.Root defaultValue="games" style={{ height: '100%' }}>
          <Flex direction="column" gap="3" style={{ height: '100%' }}>
            <Flex justify={'between'} css={{ p: '$3' }}>
              <Tabs.List>
                <Tabs.Trigger value="games" asChild>
                  <TabButton ghost size="3">
                    My Games
                  </TabButton>
                </Tabs.Trigger>
                <Tabs.Trigger value="lobby" asChild>
                  <TabButton ghost size="3">
                    Lobby
                  </TabButton>
                </Tabs.Trigger>
                <Tabs.Trigger value="streams" asChild>
                  <TabButton ghost size="3">
                    Streams
                  </TabButton>
                </Tabs.Trigger>
                <Tabs.Trigger value="account" asChild>
                  <TabButton ghost size="3">
                    Account
                  </TabButton>
                </Tabs.Trigger>
              </Tabs.List>
              <Dialog.Close asChild>
                <IconButton size="3">
                  <Cross2Icon />
                </IconButton>
              </Dialog.Close>
            </Flex>
            <ScrollAreaRoot css={{ background: 'red' }}>
              <ScrollAreaViewport>
                <GamesTabContent />
                <LobbyTabContent />
                <StreamsTabContent />
                <AccountTabContent />
              </ScrollAreaViewport>
              <ScrollAreaScrollbar orientation="vertical">
                <ScrollAreaThumb />
              </ScrollAreaScrollbar>
            </ScrollAreaRoot>
          </Flex>
        </Tabs.Root>
      </StyledDialogContent>
    </MenuContext.Provider>
  );
};

const LobbyTabContent = () => {
  // const { archetypes } = useContext(WorldContext);
  // const userEntities = useEntities(archetypes.user);
  // console.log(userEntities);
  const playersOnlineCount = 5;
  const liveGamesCount = 2;
  return (
    <Tabs.Content value="lobby">
      <Card css={{ p: '$3', minHeight: '200px' }} variant="interactive">
        <Caption>Players Online</Caption>
        <Heading>{playersOnlineCount}</Heading>
        <Caption>Live Games</Caption>
        <Heading>{liveGamesCount}</Heading>
      </Card>
    </Tabs.Content>
  );
};

const StreamsTabContent = () => {
  // get the userEntity here
  const { entityStoreRegistry, entitiesById } = useContext(WorldContext);
  const channelId = useCurrentChannelId();

  const menu$ = useContext(MenuContext);
  const { userEntity } = useStore(menu$, { keys: ['userEntity'] });

  const streamIds = useEntitySelectorDeepEqual(
    userEntity,
    (entity) => entity.streamIds
  );

  const handlePressCreateStream = useCallback(() => {
    const sessionEntity = entityStoreRegistry.mySessionEntity.get();
    assert(sessionEntity, 'expected sessionEntity');
    assert(channelId, 'expected channelId');

    const userEntity = entitiesById.get(sessionEntity.userId) as
      | UserEntity
      | undefined;
    assert(userEntity, 'expected userEntity');

    userEntity.send({
      type: 'CREATE_STREAM',
      roomId: channelId,
    });
  }, [entityStoreRegistry, entitiesById, channelId]);

  return (
    <Tabs.Content value="streams">
      <Flex direction="column" gap="3">
        {streamIds.map((streamId) => (
          <Stream key={streamId} streamId={streamId} />
        ))}
        <Button onClick={handlePressCreateStream}>Create Stream</Button>
      </Flex>
    </Tabs.Content>
  );
};

const PUBLIC_HLS_SERVER_URL = 'http://127.0.0.1';

const Stream: FC<{ streamId: string }> = ({ streamId }) => {
  const streamToken = useEntityIdProp<StreamEntity, 'token'>(streamId, 'token');
  // const hostId = useEntityIdProp<StreamEntity>(streamId, 'hostId');
  const streamUrl = `${PUBLIC_HLS_SERVER_URL}/${streamToken}.m3u8`;

  const [showCopied, setShowCopied] = useState(false);
  const streamUrlRef = useRef<HTMLInputElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handlePressCopyUrl = useCallback(() => {
    const el = streamUrlRef.current;
    assert(el, 'expected ref to streamUrl element');
    // Select the text field
    el.select();
    el.setSelectionRange(0, 99999); // For mobile devices

    navigator.clipboard.writeText(streamUrl);
    setShowCopied(true);

    timeoutRef.current = setTimeout(() => {
      setShowCopied(false);
    }, 5000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [streamUrlRef, streamUrl, setShowCopied, timeoutRef]);

  return (
    <Box>
      <input disabled type="text" value={streamUrl} ref={streamUrlRef} />
      <Flex align="center" gap="2">
        <Button onClick={handlePressCopyUrl}>Copy URL</Button>
        {showCopied && <Text>copied!</Text>}
      </Flex>
    </Box>
  );
};

const AccountTabContent = () => {
  const [isMobile] = useState(isMobileDevice(navigator.userAgent));

  return (
    <Tabs.Content value="account">
      <Flex direction="column" gap="3">
        QR Code Here
        {isMobile ? <MobileQrCode /> : <DesktopQrCode />}
      </Flex>
    </Tabs.Content>
  );
};

const MobileQrCode = () => {
  return (
    <div>
      Open explorers.cafe/scan on another device and scan the temporary code
      below.
    </div>
  );
};

const DesktopQrCode = () => {
  const { client } = trpc.useContext();
  const mutation = trpc.session.generateOneTimeToken.useMutation();

  useEffect(() => {
    // todo backoff logic here... rxjs?
    if (!mutation.isSuccess && mutation.failureCount === 0 && mutation.isIdle) {
      mutation.mutate();
    }
  }, [mutation]);

  if (mutation.isLoading) {
    return <Box>Generating QR Code...</Box>;
  }

  if (mutation.isSuccess) {
    return <Box>Token: {mutation.data.token}</Box>;
  }

  // console.log({ f });

  // client
  // client.
  // client.session
  // const sub = client.entity.list.subscribe(undefined, {
  //   onError(err) {
  //     console.error(err);
  //   },
  //   onData(event) {
  //     if (event.type === 'ADDED') {
  //       for (const entityProps of event.entities) {
  //         const entity = createEntity(entityProps);

  //         entitiesById.set(entityProps.id, entity);
  //         world.add(entity);
  //       }
  //     } else if (event.type === 'REMOVED') {
  //       for (const entityProps of event.entities) {
  //         const entity = entitiesById.get(entityProps.id);
  //         if (!entity) {
  //           console.error('missing entity when trying to remove');
  //           return;
  //         }

  //         world.remove(entity);
  //       }
  //     } else if (event.type === 'CHANGED') {
  //       for (const change of event.changedEntities) {
  //         const entity = entitiesById.get(change.id);
  //         if (!entity) {
  //           console.error('missing entity when trying to apply patches');
  //           return;
  //         }

  //         for (const operation of change.patches) {
  //           if (operation.path.match(/^\/\w+$/) && operation.op === 'add') {
  //             const pathParts = operation.path.split('/');
  //             const component = pathParts[1] as keyof typeof entity;
  //             world.addComponent(entity, component, operation.value);
  //           } else if (
  //             operation.path.match(/^\/\w+$/) &&
  //             operation.op === 'remove'
  //           ) {
  //             const pathParts = operation.path.split('/');
  //             const component = pathParts[1] as keyof typeof entity;
  //             world.removeComponent(entity, component);
  //           } else {
  //             applyPatch(entity, change.patches);
  //           }
  //         }

  //         const next = nextFnById.get(entity.id);
  //         if (!next) {
  //           throw new Error('expected next function for entity ' + entity.id);
  //         }

  //         next({
  //           type: 'CHANGE',
  //           patches: change.patches,
  //         });
  //       }
  //     }
  //   },
  // });

  return (
    <Flex direction="column">
      <Heading>Play From Mobile Device</Heading>
      <Box>
        Scan the code below on your mobile device to play across screen.
      </Box>
      <div>
        {new URL(import.meta.env.PUBLIC_WEB_SERVER_URL).host}
        /one-time-pass?token=FOO
      </div>
    </Flex>
  );
};

// Shows a list of games pulled from the world
const GamesTabContent = () => {
  //   const send = useAppSend();
  const handlePressStart = useCallback(() => {
    // send({ type: 'START_ROOM' });
  }, []);

  // const { world, archetypes } = useContext(WorldContext);

  // const entities = useEntities(archetypes.room);
  // console.log({ entities });
  // const entities = useEntities('room');

  return (
    <Tabs.Content value="games">
      <Flex direction="column" gap="3">
        <Card css={{ p: '$3', minHeight: '200px' }} variant="interactive">
          Hello
        </Card>
        <Card
          css={{
            p: '$3',
            minHeight: '200px',
            position: 'sticky',
            bottom: 0,
          }}
          color="success"
          variant="interactive"
          onClick={handlePressStart}
        >
          Start New Game
        </Card>
      </Flex>
    </Tabs.Content>
  );
};

const MenuDrawerOverlay = styled(Dialog.Overlay, {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'white',
});
