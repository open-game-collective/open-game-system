import type { Grid, Hex } from 'honeycomb-grid';
import { createContext } from 'react';

export const FieldContext = createContext(
  {} as {
    grid: Grid<Hex>;
  }
);
