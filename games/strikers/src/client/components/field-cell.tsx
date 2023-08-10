import { HexCoordinates } from 'honeycomb-grid';
import { FC, ReactNode, useCallback, useContext, useState } from 'react';
import { FieldContext } from './field.context';

interface Props {
  tilePosition: HexCoordinates;
  children?: ReactNode;
}

export const FieldCell: FC<Props> = ({ children, tilePosition }) => {
  const { grid } = useContext(FieldContext);
  const hex = grid.getHex(tilePosition)!;
  const [color, setColor] = useState(0x0000ff);

  const handlePointerOver = useCallback(() => {
    console.log('OVER', hex.row, hex.col);
  }, [hex]);

  return (
    <group
      position={[grid.pixelWidth / 2, 1, grid.pixelHeight / 2]}
      onPointerOver={handlePointerOver}
    >
      <group position={[hex.center.x, 0, hex.center.y]}>{children}</group>
    </group>
  );
};
