import { Grid, defineHex, rectangle } from 'honeycomb-grid';
import { FieldCanvas } from './field-canvas';
import { useState } from 'react';

export default {
  component: FieldCanvas,
};

const canvasWidth = 800; // or your desired canvas width
const canvasHeight = 600; // or your desired canvas height
const hexCountWidth = 25;
const hexCountHeight = 15;

const hexSize = Math.min(
  canvasWidth / hexCountWidth,
  canvasHeight / hexCountHeight
);

const HexTile = defineHex({ dimensions: hexSize });

export const Default = {
  render: () => {
    const [grid] = useState(
      new Grid(
        HexTile,
        rectangle({ width: hexCountWidth, height: hexCountHeight })
      )
    );
    return (
      <FieldCanvas grid={grid} width={canvasWidth} height={canvasHeight} />
    );
  },
};
