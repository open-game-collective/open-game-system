import { map } from 'nanostores';
import {
  BarNavigation,
  BarNavigationLeft,
  BarNavigationMain,
  BarNavigationRight,
} from './BarNavigation'; // Adjust the path to where your BarNavigation component is located
import { IconButton } from '@atoms/IconButton';

export default {
  component: BarNavigation,
};

export const Default = {
  render: () => {
    return (
      <BarNavigation store={map({})}>
        <BarNavigationLeft>
          <IconButton></IconButton>
        </BarNavigationLeft>
        <BarNavigationMain>
          <h1>Main Content</h1>
        </BarNavigationMain>
        <BarNavigationRight>
          <span>Right Icon</span>
        </BarNavigationRight>
      </BarNavigation>
    );
  },
};

export const WithDifferentContent = {
  render: () => {
    return (
      <BarNavigation store={store}>
        <BarNavigationLeft>
          <span>Back</span>
        </BarNavigationLeft>
        <BarNavigationMain>
          <h1>Profile</h1>
        </BarNavigationMain>
        <BarNavigationRight>
          <span>Settings</span>
        </BarNavigationRight>
      </BarNavigation>
    );
  },
};
