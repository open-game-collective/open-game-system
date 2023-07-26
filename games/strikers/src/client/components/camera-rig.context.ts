import { Grid, Hex } from 'honeycomb-grid';
import { MapStore } from 'nanostores';
import { createContext } from 'react';

export interface CameraRigSettings {
  center: [number, number];
  zoom: number;
  heading: number;
  tilt: number;
  scaleFactor: number;
  grid: Grid<Hex>;
}

export const CameraRigContext = createContext(
  {} as MapStore<CameraRigSettings>
);
