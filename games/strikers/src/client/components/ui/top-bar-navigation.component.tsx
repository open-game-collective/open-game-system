import { Flex } from '@atoms/Flex';
import { IconButton } from '@atoms/IconButton';
import { LayoutContext } from '@context/LayoutContext';
import { useStore } from '@nanostores/react';
import { HamburgerMenuIcon, PersonIcon } from '@radix-ui/react-icons';
import { FC, ReactNode, useCallback, useContext } from 'react';

export const TopBarNavigation: FC<{ children?: ReactNode }> = ({
  children,
}) => {
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
      gap="2"
      css={{
        background:
          'linear-gradient(to top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5))',
        position: 'absolute',
        border: '4px dashed red',
        top: '0',
        left: '0',
        right: '0',
        p: '$2',
        zIndex: 200,
      }}
    >
      {!isMenuOpen && (
        <IconButton variant="ghost" size="1" onClick={handlePressMenu}>
          <HamburgerMenuIcon color="white" />
        </IconButton>
      )}
      {children}
      <IconButton variant="ghost" size="1">
        <PersonIcon color="white" />
      </IconButton>
      {/* <img style={{ height: '42px' }} src={logoRef} alt="Explorers Logo" /> */}
    </Flex>
  );
};
