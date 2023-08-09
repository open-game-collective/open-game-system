import { Grid, Hex } from 'honeycomb-grid';
import { createContext } from 'react';

export const GridContext = createContext({} as Grid<Hex>);

