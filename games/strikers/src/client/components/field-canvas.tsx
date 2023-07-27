import { Grid, Hex } from 'honeycomb-grid';
import { useEffect, useRef } from 'react';
import drawHexagons from '../drawing/drawHexagons';

interface FieldCanvasProps {
  grid: Grid<Hex>;
  width: number | string;
  height: number | string;
}

export const FieldCanvas = ({ grid, width, height }: FieldCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');

    if (ctx) {
      ctx.canvas.width = typeof width === 'number' ? width : parseInt(width);
      ctx.canvas.height =
        typeof height === 'number' ? height : parseInt(height);
      drawHexagons(ctx, grid);
    }
  }, [grid, width, height]);

  return (
    <canvas ref={canvasRef} style={{ width, height, background: '#eee' }} />
  );
};
