import { Flex } from '@atoms/Flex';
import { IconButton } from '@atoms/IconButton';
import { LayoutContext } from '@context/LayoutContext';
import { HamburgerMenuIcon, PersonIcon } from '@radix-ui/react-icons';
import { useCallback, useContext } from 'react';
import logoRef from '../../../../static/base_logo_black_horizontal.png';
import { useStore } from '@nanostores/react';

export const TopNav = () => {
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
        background: 'linear-gradient(to top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5))',
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
        <IconButton variant="ghost" size="3" onClick={handlePressMenu}>
          <HamburgerMenuIcon />
        </IconButton>
      )}
      <IconButton variant="ghost" size="3">
        <PersonIcon />
      </IconButton>
      {/* <img style={{ height: '42px' }} src={logoRef} alt="Explorers Logo" /> */}
    </Flex>
  );
};
