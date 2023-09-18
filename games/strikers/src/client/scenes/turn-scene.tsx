import { SunsetSky } from '@3d/sky';
import { StrikersTurnEntity } from '@explorers-club/schema';
import { useCreateEntityStore } from '@hooks/useCreateEntityStore';
import {
  useEntitySelector,
  useEntitySelectorDeepEqual,
} from '@hooks/useEntitySelector';
import { useStore } from '@nanostores/react';
import { useThree } from '@react-three/fiber';
import { spiral } from 'honeycomb-grid';
import { map } from 'nanostores';
import { FC, useContext, useLayoutEffect } from 'react';
import { Vector3 } from 'three';
import { lookBirdsEye } from '../camera.utils';
import { CameraRigContext } from '../components/camera-rig.context';
import { Field, FieldControls } from '../components/field';
import { FieldCell } from '../components/field-cell';
import { Goal } from '../components/goal';
import { GridContext } from '../context/grid.context';
import { StrikersContext } from '../context/strikers.context';
import { TurnContext } from '../context/turn.context';
import { ClientEventContext } from '../context/client-event.context';
import { CardMeeple } from '../components/card-meeple';
import { Ball } from '../components/ball';

export const TurnScene = () => {
  const { send, event$ } = useContext(ClientEventContext);

  useLayoutEffect(() => {
    return event$.listen((event) => {
      console.log('YO EVENT! turn scene', event);
    });
  });

  const { gameEntity } = useContext(StrikersContext);
  const ballPosition = useEntitySelectorDeepEqual(
    gameEntity,
    (entity) => entity.gameState.ballPosition
  );

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
        <FieldControls />
        <Goal side="A" />
        <Goal side="B" />
        {ballPosition && (
          <FieldCell tilePosition={ballPosition}>
            <Ball />
          </FieldCell>
        )}
        {homeSideCardIds.map((cardId) => (
          <FieldCell key={cardId} tilePosition={tilePositionsByCardId[cardId]}>
            <CardMeeple team="home" cardId={cardId} />
          </FieldCell>
        ))}
        {awaySideCardIds.map((cardId) => (
          <FieldCell key={cardId} tilePosition={tilePositionsByCardId[cardId]}>
            <CardMeeple team="away" cardId={cardId} />
          </FieldCell>
        ))}
      </Field>
    </>
  );
};

const turnCamera$ = map({
  openingSequenceComplete: false,
  focusedCardId: undefined as string | undefined,
});

const TurnCamera = () => {
  const { camera } = useThree();
  const { openingSequenceComplete } = useStore(turnCamera$);

  const { gameEntity, playerEntity } = useContext(StrikersContext);
  const turnId = useEntitySelector(
    gameEntity,
    (entity) => entity.turnsIds[entity.turnsIds.length - 1]
  );

  const turnEntity$ = useCreateEntityStore<StrikersTurnEntity>(
    (entity) => entity.id === turnId,
    [turnId]
  );
  const turnEntity = useStore(turnEntity$);

  if (!turnEntity) {
    return null;
  }

  return (
    <TurnContext.Provider value={{ turnEntity }}>
      {!openingSequenceComplete ? (
        <OpeningSequence initialCameraPosition={camera.position} />
      ) : (
        <FollowActionCamera />
      )}
    </TurnContext.Provider>
  );
};

/**
 * Follows the action of the turn
 */
const FollowActionCamera = () => {
  const { gameEntity } = useContext(StrikersContext);
  const { channel } = gameEntity;
  const { service } = useContext(CameraRigContext);
  const grid = useContext(GridContext);

  useLayoutEffect(() => {
    channel.subscribe((event) => {
      if (event.type === 'SELECT_CARD') {
        const tilePosition =
          gameEntity.gameState.tilePositionsByCardId[event.cardId];
        service.send({
          type: 'POSITION',
          target: grid.traverse(
            spiral({
              start: tilePosition,
              radius: 4,
            })
          ),
        });
      }
    });
  }, [channel]);

  return null;
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
      turnCamera$.setKey('openingSequenceComplete', true);
    })();
  }, [cameraControls]);

  return null;
};
