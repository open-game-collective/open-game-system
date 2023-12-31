import { StrikersTileCoordinate } from '@schema/games/strikers';
import { Point } from 'honeycomb-grid';
import { Vector3 } from 'three';
import {
  convertStrikersTileCoordinateToRowCol,
  gridPointToWorldPosition,
  worldPositionToGridPoint,
} from './utils';

describe('convertStrikersTileCoordinateToRowCol', () => {
  it('should correctly convert A1 to row 0 and col 0', () => {
    const input: StrikersTileCoordinate = 'A1';
    const result = convertStrikersTileCoordinateToRowCol(input);
    expect(result).toEqual({ row: 0, col: 0 });
  });

  it('should correctly convert B5 to row 1 and col 4', () => {
    const input: StrikersTileCoordinate = 'B5';
    const result = convertStrikersTileCoordinateToRowCol(input);
    expect(result).toEqual({ row: 1, col: 4 });
  });

  it('should correctly convert Z20 to row 25 and col 19', () => {
    const input: StrikersTileCoordinate = 'Z20';
    const result = convertStrikersTileCoordinateToRowCol(input);
    expect(result).toEqual({ row: 25, col: 19 });
  });
});

describe('gridPointToWorldPosition', () => {
  it('should convert a point on the honeycomb grid to world space centered at (0, 0) with y value 0', () => {
    const gridPoint: Point = { x: 10, y: 20 };
    const gridWidth = 30;
    const gridHeight = 40;

    const result = gridPointToWorldPosition(gridPoint, gridWidth, gridHeight);

    expect(result).toEqual(new Vector3(-5, 0, 0));
  });
});

describe('worldPositionToGridPoint', () => {
  it('should convert a point in world space back to a point on the honeycomb grid', () => {
    const worldPosition = new Vector3(-5, 0, 0);
    const gridWidth = 30;
    const gridHeight = 40;

    const result = worldPositionToGridPoint(
      worldPosition,
      gridWidth,
      gridHeight
    );

    expect(result).toEqual({ x: 10, y: 20 });
  });
});
