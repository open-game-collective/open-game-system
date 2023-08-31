import { FieldHex } from '@strikers/lib/field-hex';
import { Grid, Hex } from 'honeycomb-grid';
import { createContext } from 'react';

export const GridContext = createContext({} as Grid<FieldHex>);
