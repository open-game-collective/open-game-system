import { Button } from '@atoms/Button';
import { Caption } from '@atoms/Caption';
import { Card } from '@atoms/Card';
import { Flex } from '@atoms/Flex';
import { Heading } from '@atoms/Heading';
import { IconButton } from '@atoms/IconButton';
import { Image } from '@atoms/Image';
import { ScrollAreaRoot } from '@atoms/ScrollArea';
import { Text } from '@atoms/Text';
import { styled } from '@explorers-club/styles';
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon, OpenInNewWindowIcon } from '@radix-ui/react-icons';
import {
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from '@radix-ui/react-scroll-area';
import * as Tabs from '@radix-ui/react-tabs';
import { useCallback } from 'react';
import { isMenuOpenStore } from '../state/layout';
import { useStore } from '@nanostores/react';
// import { selectNavIsOpen } from './app.selectors';

export const Menu = () => {
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
      <Dialog.Portal>
        <MenuDrawerOverlay />
        <MenuDrawerContent />
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const StyledDialogContent = styled(Dialog.Content, {
  position: 'fixed',
  left: 0,
  top: 0,
  bottom: 0,
  width: '100%',
  zIndex: 300,
  backgroundColor: '$primary3',
  '@bp2': {
    maxWidth: '50%',
  },
  '@bp3': {
    maxWidth: '30%',
  },
  '@bp4': {
    maxWidth: '20%',
  },
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

const MenuDrawerContent = () => {
  return (
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
              <Tabs.Trigger value="shop" asChild>
                <TabButton ghost size="3">
                  Shop
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
              <ShopTabContent />
            </ScrollAreaViewport>
            <ScrollAreaScrollbar orientation="vertical">
              <ScrollAreaThumb />
            </ScrollAreaScrollbar>
          </ScrollAreaRoot>
        </Flex>
      </Tabs.Root>
    </StyledDialogContent>
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

const ShopTabContent = () => {
  return (
    <Tabs.Content value="shop">
      <Flex direction="column" gap="3">
        <Card
          css={{
            background: `linear-gradient($primary4, $primary7)`,
            border: '2px solid $primary6',
          }}
        >
          <Image
            css={{ aspectRatio: 1, width: '100%' }}
            src="https://cdn.discordapp.com/attachments/1039255735390978120/1082663770159071272/pigment-dyed-cap-black-stone-front-640601d4ccad3.png"
          />
        </Card>
        <a href="https://merch.explorers.club" target="_blank">
          <Card css={{ p: '$3', minHeight: '200px' }} variant="interactive">
            <Text>
              Open Merch Store <OpenInNewWindowIcon />
            </Text>
          </Card>
        </a>
      </Flex>
    </Tabs.Content>
  );
};

// Shows a list of games pulled from the world
const GamesTabContent = () => {
  //   const send = useAppSend();
  const handlePressStart = useCallback(() => {
    console.log('START!');
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
  backgroundColor: 'rgba(0,0,0,.7)',
});
