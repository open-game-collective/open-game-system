import { assert } from '@explorers-club/utils';
import { StrikersTileCoordinate } from '@schema/games/strikers';
import { Grid, Hex, HexCoordinates, Point } from 'honeycomb-grid';
import { Vector3 } from 'three';

export function convertStrikersTileCoordinateToRowCol(
  coordinate: StrikersTileCoordinate
) {
  // Extract the letter and number parts
  const letter = coordinate[0];
  const number = parseInt(coordinate.substring(1));

  // Convert the letter to a row number (0-based)
  const row = letter.charCodeAt(0) - 'A'.charCodeAt(0);

  // Adjust the number to be 0-based column
  const col = number - 1;

  return { row, col };
}

export const gridHexToWorldPosition = (
  coordinate: HexCoordinates,
  grid: Grid<Hex>
) => {
  const hex = grid.getHex(coordinate);
  assert(hex, 'expected hex');
  const { x, y } = hex;
  return gridPointToWorldPosition({ x, y }, grid.pixelWidth, grid.pixelHeight);
};

export const gridPointToWorldPosition = (
  point: Point,
  gridWidth: number,
  gridHeight: number
) => {
  const worldX = point.x - gridWidth * 0.5;
  const worldZ = point.y - gridHeight * 0.5;

  return new Vector3(worldX, 0, worldZ);
};

export const worldPositionToGridPoint = (
  position: Vector3,
  gridWidth: number,
  gridHeight: number
): Point => {
  const gridX = Math.round(position.x + gridWidth * 0.5);
  const gridY = Math.round(position.z + gridHeight * 0.5);

  return { x: gridX, y: gridY };
};
