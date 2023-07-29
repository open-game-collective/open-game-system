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
    console.log('OVER');
  }, []);

  const handleClick = useCallback(() => {
    setColor(0xffffff);
    console.log('click', hex);
  }, [hex]);
  console.log(hex.center.x, hex.center.y);

  return (
    <group
      position={[hex.center.x, 0, hex.center.y]}
      onPointerOver={handlePointerOver}
    >
      <axesHelper />
      {children}
      <mesh onClick={handleClick} position={[0, -1, 0]}>
        <cylinderBufferGeometry attach="geometry" args={[1, 1, 1, 6, 1]} />
        <meshStandardMaterial attach="material" color={color} />
      </mesh>
    </group>
  );
};
