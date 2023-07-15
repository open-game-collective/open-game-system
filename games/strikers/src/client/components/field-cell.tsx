import { HexCoordinates } from 'honeycomb-grid';
import { FC, ReactNode } from 'react';

interface Props {
  tilePosition: HexCoordinates;
  children?: ReactNode;
}

export const FieldCell: FC<Props> = ({ children }) => {
  // todo calc position...
  // return <group>{children}</group>;
  return <group position={[[]]}></group>
};
