import { HexCoordinates, defineHex } from 'honeycomb-grid';
import { map } from 'nanostores';

const fieldHex$ = map({
  selected: false,
});

type FieldHexData = typeof fieldHex$;

export class FieldHex extends defineHex({ dimensions: 1 }) {
  static create(coordinates: HexCoordinates, data: FieldHexData) {
    const hex = new FieldHex(coordinates);
    hex.data = data;
    return hex;
  }

  // this property is present in the instance
  data!: FieldHexData;

  // methods always exist in the prototype
  customMethod() {}
}
