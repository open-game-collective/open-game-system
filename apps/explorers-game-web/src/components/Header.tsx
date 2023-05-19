import logoRef from '../../../../static/base_logo_black_horizontal.png';
import { IconButton } from '@atoms/IconButton';
import { Logo } from '@atoms/Logo';
import { HamburgerMenuIcon, PersonIcon } from '@radix-ui/react-icons';
import { useCallback } from 'react';
import { menuIsOpenStore } from '../state/layout';
import { useStore } from '@nanostores/react';

export const Header = () => {
  const menuIsOpen = useStore(menuIsOpenStore);
  const handlePressMenu = useCallback(() => {
    console.log('OPEN');
  }, [menuIsOpen]);

  return (
    <header>
      <IconButton variant="raised" size="3" onClick={handlePressMenu}>
        <HamburgerMenuIcon />
      </IconButton>
      <img src={logoRef} alt="Explorers Logo" />
    </header>
  );
};
