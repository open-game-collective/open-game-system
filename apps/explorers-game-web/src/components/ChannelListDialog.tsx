import { Button } from '@atoms/Button';
import { Caption } from '@atoms/Caption';
import { isMobileDevice } from '@explorers-club/utils';
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
import {
  ForwardedRef,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useStore } from '@nanostores/react';
import { LayoutContext } from '@context/LayoutContext';
import { Box } from '@atoms/Box';
import { trpc } from '@explorers-club/api-client';
import { WorldContext } from '@context/WorldProvider';
import { useEntityStoreSelector } from '@hooks/useEntityStoreSelector';
// import { selectNavIsOpen } from './app.selectors';

export const ChannelListDialog = () => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const { isChannelListOpenStore } = useContext(LayoutContext);
  const isOpen = useStore(isChannelListOpenStore);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        isChannelListOpenStore.set(false);
      }
    },
    [isChannelListOpenStore]
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal container={container}>
        <DialogOverlay />
        <DialogContent />
      </Dialog.Portal>
      <ModalContainer ref={setContainer} />
    </Dialog.Root>
  );
};

const ModalContainer = forwardRef((_, ref: ForwardedRef<HTMLDivElement>) => {
  const { isChannelListOpenStore } = useContext(LayoutContext);
  const isOpen = useStore(isChannelListOpenStore);

  return (
    <Box
      ref={ref}
      css={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        zIndex: isOpen ? 100 : -9999,
      }}
    />
  );
});

const StyledDialogContent = styled(Dialog.Content, {
  position: 'absolute',
  left: 0,
  bottom: 0,
  right: 0,
  background: '$primary3',
});

// .TabsTrigger[data-state='active'] {
//   color: var(--violet11);
//   box-shadow: inset 0 -1px 0 0 currentColor, 0 1px 0 0 currentColor;
// }

const DialogContent = () => {
  const { entityStoreRegistry } = useContext(WorldContext);

  const allChannelIds = useEntityStoreSelector(
    entityStoreRegistry.myConnectionEntity,
    (entity) => entity.allChannelIds
  );
  const currentChannelId = useEntityStoreSelector(
    entityStoreRegistry.myConnectionEntity,
    (entity) => entity.currentChannelId
  );
  console.log({ allChannelIds, currentChannelId });

  return (
    <StyledDialogContent>
      <Dialog.Close asChild>
        <IconButton size="3">
          <Cross2Icon />
        </IconButton>
      </Dialog.Close>
      <ScrollAreaRoot css={{ background: 'red' }}>
        <ScrollAreaViewport>My Channels</ScrollAreaViewport>
        <ScrollAreaScrollbar orientation="vertical">
          <ScrollAreaThumb />
        </ScrollAreaScrollbar>
      </ScrollAreaRoot>
    </StyledDialogContent>
  );
};
const DialogOverlay = styled(Dialog.Overlay, {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,.7)',
});
