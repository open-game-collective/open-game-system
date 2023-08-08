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
