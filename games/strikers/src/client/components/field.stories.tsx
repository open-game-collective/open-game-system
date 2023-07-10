import { Canvas } from '@react-three/fiber';
import { Field } from './field';
import { FieldCell } from './field-cell';
import { Environment, OrbitControls } from '@react-three/drei';

export default {
  component: Field,
};

export const Default = {
  render: () => {
    const cells = [
      [0, 1],
      [0, 2],
      [0, 3],
    ];

    return (
      <Canvas style={{ background: '#eee', aspectRatio: '1' }}>
        <OrbitControls />
        <ambientLight />
        <pointLight />
        <Field>
          {cells.map((cell, idx) => {
            return <FieldCell key={idx} tilePosition={[0, 1]} />;
          })}
        </Field>
      </Canvas>
    );
  },
};
