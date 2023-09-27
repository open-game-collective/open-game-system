import { Flex } from '@atoms/Flex';
import { IconButton } from '@atoms/IconButton';
import { Cross2Icon, ThickArrowLeftIcon } from '@radix-ui/react-icons';
import type { FC, ReactNode } from 'react';

export const BottomNav: FC<{ children?: ReactNode }> = ({ children }) => {
  const isBottomNavOpen = true;
  const showBackButton = false;
  const showCloseButton = false;
  // const { isMenuOpenStore } = useContext(LayoutContext);
  // const handlePressMenu = useCallback(() => {
  //   if (isMenuOpenStore.get()) {
  //     isMenuOpenStore.set(false);
  //   } else {
  //     isMenuOpenStore.set(true);
  //   }
  // }, [isMenuOpenStore]);

  // const isMenuOpen = useStore(isMenuOpenStore);

  return isBottomNavOpen ? (
    <Flex
      justify="start"
      align="center"
      gap="2"
      css={{
        position: 'absolute',
        background: 'white',
        borderRadius: '$2',
        bottom: '$2',
        left: '$2',
        right: '$2',
        p: '$2',
        zIndex: 200,
      }}
    >
      {showBackButton && (
        <IconButton size="3">
          <ThickArrowLeftIcon />
        </IconButton>
      )}
      {children}
      {showCloseButton && (
        <IconButton size="3">
          <Cross2Icon />
        </IconButton>
      )}
    </Flex>
  ) : (
    <></>
  );
};
