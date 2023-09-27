import {
  StrikersGameEntity,
  StrikersPlayerEntity,
  StrikersTurnEntity,
} from '@explorers-club/schema';
import { OffsetCoordinates } from 'honeycomb-grid';

type AxialCoordinate = {
  q: number;
  r: number;
};

export function strikersTileToAxial(coord: string): AxialCoordinate {
  const colLetter = coord.slice(0, -2);
  const rowNumber = parseInt(coord.slice(-2));

  const q = colLetter.charCodeAt(0) - 'A'.charCodeAt(0);
  const r = rowNumber - 1;

  return { q, r };
}

export function axialToStrikersTile(axial: AxialCoordinate): string {
  const colLetter = String.fromCharCode(axial.q + 'A'.charCodeAt(0));
  const rowNumber = axial.r + 1;

  return `${colLetter}${rowNumber}`;
}

export function offsetToStrikersTile(offset: OffsetCoordinates): string {
  if (offset.col < 0 || offset.col > 35 || offset.row < 0 || offset.row > 25) {
    throw new Error('Invalid offset coordinate');
  }

  // Map 0-25 to A-Z for rows
  const rowLetter = String.fromCharCode(offset.row + 'A'.charCodeAt(0));

  // Map 0-35 to 1-36 for columns
  const colNumber = offset.col + 1;

  return `${rowLetter}${colNumber}`;
}

export const isPlayersTurn = (
  playerEntity: StrikersPlayerEntity,
  gameEntity: StrikersGameEntity,
  turnEntity: StrikersTurnEntity
) => {
  if (turnEntity.teamSide === 'home') {
    return gameEntity.config.homeTeamPlayerIds.includes(playerEntity.id);
  } else {
    return gameEntity.config.awayTeamPlayerIds.includes(playerEntity.id);
  }
};
