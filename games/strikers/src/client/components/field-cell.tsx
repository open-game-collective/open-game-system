import { HexCoordinates } from 'honeycomb-grid';
import { FC, ReactNode, useCallback, useContext } from 'react';
import { GridContext } from '../context/grid.context';
import { ClientEventContext } from '../context/client-event.context';

interface Props {
  tilePosition: HexCoordinates;
  children?: ReactNode;
}

export const FieldCell: FC<Props> = ({ children, tilePosition }) => {
  const grid = useContext(GridContext);
  const { send } = useContext(ClientEventContext);
  const hex = grid.getHex(tilePosition)!;

  const handlePointerUp = useCallback(() => {
    send({ type: 'PRESS_TILE', position: hex });
  }, [tilePosition]);

  return (
    <group
      position={[grid.pixelWidth / 2, 1, grid.pixelHeight / 2]}
      onPointerUp={handlePointerUp}
    >
      <group position={[hex.center.x, 0, hex.center.y]}>{children}</group>
    </group>
  );
};
