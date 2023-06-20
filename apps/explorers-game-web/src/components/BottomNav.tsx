import { Flex } from '@atoms/Flex';
import { IconButton } from '@atoms/IconButton';
import { LayoutContext } from '@context/LayoutContext';
import {
  BackpackIcon,
  HamburgerMenuIcon,
  PersonIcon,
  ThickArrowLeftIcon,
} from '@radix-ui/react-icons';
import { useCallback, useContext } from 'react';
import { useStore } from '@nanostores/react';

export const BottomNav = () => {
  const { isMenuOpenStore } = useContext(LayoutContext);
  const handlePressMenu = useCallback(() => {
    if (isMenuOpenStore.get()) {
      isMenuOpenStore.set(false);
    } else {
      isMenuOpenStore.set(true);
    }
  }, [isMenuOpenStore]);

  const isMenuOpen = useStore(isMenuOpenStore);

  return (
    <Flex
      justify="between"
      align="center"
      css={{
        background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5))',
        position: 'absolute',
        border: '4px dashed yellow',
        bottom: '0',
        left: '0',
        right: '0',
        p: '$2',
        zIndex: 200,
      }}
    >
      <IconButton variant="stroke" size="3">
        <ThickArrowLeftIcon />
      </IconButton>
    </Flex>
  );
};
