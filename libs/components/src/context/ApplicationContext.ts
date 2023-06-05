import { RouteProps } from '@explorers-club/schema';
import type { WritableAtom } from 'nanostores';
import { createContext } from 'react';

export const ApplicationContext = createContext(
  {} as {
    routeStore: WritableAtom<RouteProps>;
  }
);
