import { SunsetSky } from '@3d/sky';
import { useEntitySelectorDeepEqual } from '@hooks/useEntitySelector';
import { useThree } from '@react-three/fiber';
import { FC, useContext, useLayoutEffect } from 'react';
import { Vector3 } from 'three';
import { lookBirdsEye } from '../camera.utils';
import { CameraRigContext } from '../components/camera-rig.context';
import { Field } from '../components/field';
import { FieldCell } from '../components/field-cell';
import { Goal } from '../components/goal';
import { StrikersContext } from '../context/strikers.context';

export const TurnScene = () => {
  const { gameEntity } = useContext(StrikersContext);
  const tilePositionsByCardId = useEntitySelectorDeepEqual(
    gameEntity,
    (entity) => entity.gameState.tilePositionsByCardId
  );
  const homeSideCardIds = useEntitySelectorDeepEqual(
    gameEntity,
    (entity) => entity.gameState.sideACardIds
  );
  const awaySideCardIds = useEntitySelectorDeepEqual(
    gameEntity,
    (entity) => entity.gameState.sideBCardIds
  );

  return (
    <>
      <SunsetSky />
      <TurnCamera />
      <Field>
        <Goal side="away" />
        <Goal side="home" />
        {homeSideCardIds.map((cardId) => (
          <FieldCell key={cardId} tilePosition={tilePositionsByCardId[cardId]}>
            <mesh>
              <boxBufferGeometry />
              <meshBasicMaterial color="blue" />
            </mesh>
          </FieldCell>
        ))}
        {awaySideCardIds.map((cardId) => (
          <FieldCell key={cardId} tilePosition={tilePositionsByCardId[cardId]}>
            <mesh>
              <boxBufferGeometry />
              <meshBasicMaterial color="red" />
            </mesh>
          </FieldCell>
        ))}
      </Field>
    </>
  );
};

const TurnCamera = () => {
  const three = useThree();
  return <OpeningSequence initialCameraPosition={three.camera.position} />;
};

const OpeningSequence: FC<{
  initialCameraPosition: Vector3;
}> = ({ initialCameraPosition }) => {
  const { cameraControls } = useContext(CameraRigContext);

  useLayoutEffect(() => {
    const { x, y, z } = initialCameraPosition;
    cameraControls.setPosition(x, y, z, false);

    (async () => {
      await lookBirdsEye(cameraControls);
      await cameraControls.dolly(10, true);
    })();
  }, [cameraControls]);

  return null;
};
