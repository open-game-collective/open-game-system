import { Flex } from '@atoms/Flex';
import { IconButton } from '@atoms/IconButton';
import { LayoutContext } from '@context/LayoutContext';
import { HamburgerMenuIcon, PersonIcon } from '@radix-ui/react-icons';
import { useCallback, useContext } from 'react';
import logoRef from '../../../../static/base_logo_black_horizontal.png';
import { useStore } from '@nanostores/react';

export const Header = () => {
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
        position: 'absolute',
        top: '$2',
        left: '$2',
        right: '$2',
        zIndex: 200,
      }}
    >
      {!isMenuOpen && (
        <IconButton variant="raised" size="3" onClick={handlePressMenu}>
          <HamburgerMenuIcon />
        </IconButton>
      )}
      {/* <img style={{ height: '42px' }} src={logoRef} alt="Explorers Logo" /> */}
      <IconButton variant="raised" size="3" css={{ visibility: 'hidden' }}>
        <PersonIcon />
      </IconButton>
    </Flex>
  );
};
