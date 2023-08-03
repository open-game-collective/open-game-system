import { Grid, defineHex, rectangle } from 'honeycomb-grid';
import { atom } from 'nanostores';

export const gridStore = atom(
  new Grid(defineHex(), rectangle({ width: 26, height: 20 }))
);
