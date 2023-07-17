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

  const [color, setColor] = useState(0x00ff00);

  const handlePointerOver = useCallback(() => {
    console.log('OVER');
  }, []);

  const handleClick = useCallback(() => {
    setColor(0xffffff);
    console.log('click', hex);
  }, [hex]);

  // assert(
  //   hex,
  //   "expected hex to exist but couldn't find it at position" + tilePosition
  // );

  return (
    <group
      position={[hex.center.x, hex.center.y, 0]}
      rotation={[Math.PI / 2, 0, 0]}
      onPointerOver={handlePointerOver}
    >
      <axesHelper />
      {children}
      <mesh onClick={handleClick}>
        <cylinderBufferGeometry attach="geometry" args={[1, 1, 1, 6, 1]} />
        <meshStandardMaterial attach="material" color={color} />
      </mesh>
    </group>
  );
};
