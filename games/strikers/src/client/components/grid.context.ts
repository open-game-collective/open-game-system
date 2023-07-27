import type { Grid, Hex } from 'honeycomb-grid';
import { createContext } from 'react';

export const GridContext = createContext(
  {} as {
    grid: Grid<Hex>;
  }
);
