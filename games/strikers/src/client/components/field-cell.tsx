import { HexCoordinates } from 'honeycomb-grid';
import { FC, ReactNode, useCallback, useContext } from 'react';
import { GridContext } from '../context/grid.context';
import { ClientEventContext } from '../context/client-event.context';
import { gridPointToWorldPosition } from '@strikers/lib/utils';

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

  const position = gridPointToWorldPosition(
    { x: hex.x, y: hex.y },
    grid.pixelWidth,
    grid.pixelHeight
  );

  return (
    <group position={position} onPointerUp={handlePointerUp}>
      {children}
    </group>
  );
};
