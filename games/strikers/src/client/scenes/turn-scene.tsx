import { SunsetSky } from '@3d/sky';
import { StrikersTurnEntity } from '@explorers-club/schema';
import { useCreateEntityStore } from '@hooks/useCreateEntityStore';
import {
  useEntitySelector,
  useEntitySelectorDeepEqual,
} from '@hooks/useEntitySelector';
import { useStore } from '@nanostores/react';
import { useThree } from '@react-three/fiber';
import { map } from 'nanostores';
import { FC, useContext, useLayoutEffect } from 'react';
import { Vector3 } from 'three';
import { lookBirdsEye } from '../camera.utils';
import { CameraRigContext } from '../components/camera-rig.context';
import { Field } from '../components/field';
import { FieldCell } from '../components/field-cell';
import { Goal } from '../components/goal';
import { StrikersContext } from '../context/strikers.context';
import { TurnContext } from '../context/turn.context';
import { useObservableState } from 'observable-hooks';

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
  const { turnEntity } = useContext(TurnContext);
  const { playerEntity, gameEntity } = useContext(StrikersContext);
  const { cameraControls } = useContext(CameraRigContext);

  useLayoutEffect(() => {
    gameEntity.channel.subscribe((event) => {
      if (event.type === 'SELECT_CARD') {
        console.log('FOCUS CARD!', event);
      }
    });
  }, [gameEntity]);

  useLayoutEffect(() => {
    return turnCamera$.subscribe(({ focusedCardId }, changed) => {
      if (changed === 'focusedCardId') {
        console.log('focus camera on ', focusedCardId);
      }
    });
  }, [cameraControls, turnCamera$]);

  // todo fix mem leak, handle unsubscribe
  useLayoutEffect(() => {
    (async () => {
      if (playerEntity && playerEntity.id === turnEntity.playerId) {
        playerEntity.subscribe((event) => {
          console.log('player event', event);
        });
        gameEntity.subscribe((event) => {
          console.log('game event', event);
        });
        turnEntity.subscribe((event) => {
          console.log('turn event', event);
        });
        // turnEntity.subscribe((event) => {
        //   cosono
        // }
        // Could we somehow listen on the messages that get sent to the turn?

        // playerEntity.subscribe(() => {
        //   //

        // })

        // turnEntity.subscribe(() => {
        //   turnEntity.

        //   // oh god
        //   // if (typeof turnEntity.states.Status === 'object') {
        //   //   if (typeof turnEntity.states.Status.Actions === 'object') {
        //   //     if (
        //   //       typeof turnEntity.states.Status.Actions.InputtingAction ===
        //   //       'object'
        //   //     ) {
        //   //       if (
        //   //         typeof turnEntity.states.Status.Actions.InputtingAction
        //   //           .Moving === 'object'
        //   //       ) {
        //   //         if (
        //   //           typeof turnEntity.states.Status.Actions.InputtingAction
        //   //             .Moving.InputtingPlayer === 'object'
        //   //         ) {
        //   //           if (
        //   //             typeof turnEntity.states.Status.Actions.InputtingAction
        //   //               .Moving.InputtingPlayer.PlayerSelected === 'object'
        //   //           ) {
        //   //             console.log('player selected!');
        //   //           }
        //   //         }
        //   //       }
        //   //     }
        //   //   }
        //   // }
        //   // todo, is this a state machine?
        //   // we send change events to it?
        //   // it checks what is true or not?
        // });
      }
    })();
  }, [playerEntity, turnEntity]);

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
