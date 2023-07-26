import { shaderMaterial } from '@react-three/drei';
import { ReactThreeFiber, extend } from '@react-three/fiber';
import type { Hex } from 'honeycomb-grid';
import { Grid } from 'honeycomb-grid';
import { FC, ReactNode, useCallback, useMemo } from 'react';
import { Color, DoubleSide, ShaderMaterial } from 'three';
import { FieldContext } from './field.context';

type ColorShiftUniforms = {
  time: number;
  color: Color;
};

const ColorShiftMaterial = shaderMaterial(
  { time: 0, color: new Color(0.2, 0.0, 0.1) } satisfies ColorShiftUniforms,
  // vertex shader
  /*glsl*/ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // fragment shader
  /*glsl*/ `
    uniform float time;
    uniform vec3 color;
    varying vec2 vUv;
    void main() {
      gl_FragColor.rgba = vec4(0.5 + 0.3 * sin(vUv.yxx + time) + color, 1.0);
    }
  `
);
ColorShiftMaterial;

extend({ ColorShiftMaterial });

type ColorShiftMaterialImpl = ColorShiftUniforms & ShaderMaterial;
declare global {
  namespace JSX {
    interface IntrinsicElements {
      colorShiftMaterial: ReactThreeFiber.Object3DNode<
        ColorShiftMaterialImpl,
        typeof ColorShiftMaterial
      >;
    }
  }
}

export const Field: FC<{ children?: ReactNode; grid: Grid<Hex> }> = ({
  children,
  grid,
}) => {
  const cells = useMemo(() => {
    return grid.toArray();
  }, [grid]);

  const handlePointerLeave = useCallback(() => {
    console.log('leave');
  }, []);

  const handlePointerOver = useCallback(() => {
    // todo figure out how to set value on shader
    console.log('over');
  }, []);

  return (
    <FieldContext.Provider value={{ grid }}>
      <group position={[0, 0, 0]}>
        <axesHelper args={[20]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeBufferGeometry
            attach="geometry"
            args={[grid.pixelWidth * 2, grid.pixelHeight * 2]}
          />
          <meshStandardMaterial
            side={DoubleSide}
            attach="material"
            color={0x000000}
          />
        </mesh>
        {children}
        <group
          position={[grid.pixelWidth / 2, 0, -grid.pixelHeight / 2]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          {cells.map((hex) => {
            return (
              <group
                position={[hex.center.x, hex.center.y, 0]}
                onPointerOver={handlePointerOver}
                onPointerLeave={handlePointerLeave}
              >
                <axesHelper />
                {children}
                <mesh position={[-hex.width / 2, -hex.height / 2, 0]}>
                  <cylinderBufferGeometry
                    attach="geometry"
                    args={[1, 1, 5, 6, 1]}
                  />
                  <colorShiftMaterial
                    color={0x0fff00}
                    attach="material"
                    time={1}
                  />
                </mesh>
              </group>
            );
          })}
        </group>
      </group>
    </FieldContext.Provider>
  );
};
