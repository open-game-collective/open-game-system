import { Canvas } from '@react-three/fiber';
import { Field } from './field';

export default {
  component: Field,
};

export const Default = {
  render: () => {
    return (
      <Canvas style={{ background: '#eee', aspectRatio: '1' }}>
        <Field />
      </Canvas>
    );
  },
};
