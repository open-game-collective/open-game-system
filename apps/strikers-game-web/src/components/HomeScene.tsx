import { SunsetSky } from '@3d/sky';
import { Button } from '@atoms/Button';
import { ApplicationContext } from '@context/ApplicationContext';
import { ApplicationProvider } from '@context/ApplicationProvider';
import {
  PWAContext,
  PWAInstallTakeover,
  PWANotInstallable,
  PWAProvider,
  PWATakeoverContents,
} from '@context/PWAContext';
import { useStore } from '@nanostores/react';
import { Canvas } from '@react-three/fiber';
import {
  CameraRigContext,
  CameraRigProvider,
} from '@strikers/client/components/camera-rig.context';
import { Field } from '@strikers/client/components/field';
import { Goal } from '@strikers/client/components/goal';
import { GridContext } from '@strikers/client/context/grid.context';
import { getProject } from '@theatre/core';
import { SheetProvider } from '@theatre/r3f';
// import extension from '@theatre/r3f/dist/extension';
// import studio from '@theatre/studio';
import { Grid, defineHex, rectangle } from 'honeycomb-grid';
import { atom } from 'nanostores';
import { FC, useCallback, useContext, useEffect, useState } from 'react';
import { Vector3 } from 'three';
import type { MiddlewareProps } from '../middleware';
import { PushService } from './PushServiceWorker';
import { ServiceWorkerProvider } from './ServiceWorker';

// studio.initialize();
// studio.extend(extension);

const sheet = getProject('Demo Project').sheet('Demo Sheet');

const gridStore = atom(
  new Grid(defineHex(), rectangle({ width: 36, height: 26 }))
);

export const HomeScene: FC<MiddlewareProps> = ({
  initialRouteProps,
  connectionId,
  trpcUrl,
}) => {
  const [routeStore] = useState(atom(initialRouteProps));
  const grid = useStore(gridStore);

  // const handlePlay = useCallback(() => {
  //   sheet.sequence.position = 0;
  //   sheet.sequence.attachAudio({ source: '/strikers_intro.mp3' }).then(() => {
  //     sheet.sequence.play();
  //     // console.log("audio context loaded")
  //   });
  // }, [sheet]);

  return (
    <ServiceWorkerProvider>
      <PWAProvider>
        <HomePWATakeover />
        <ApplicationProvider trpcUrl={trpcUrl} connectionId={connectionId}>
          <ApplicationContext.Provider value={{ routeStore }}>
            {/* <Button
              onClick={handlePlay}
              css={{
                position: 'absolute',
                bottom: '$2',
                zIndex: 10,
                left: '50%',
                marginRight: '-50%',
              }}
            >
              Play
            </Button> */}
            <PushService />
            <Canvas
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                right: 0,
                zIndex: 1,
              }}
              camera={{ position: new Vector3(0, 1000, 1000) }}
            >
              <GridContext.Provider value={grid}>
                <SheetProvider sheet={sheet}>
                  <CameraRigProvider>
                    <AnimationSequence />
                    <SunsetSky />
                    <Field>
                      <Goal side="home" />
                      <Goal side="away" />
                    </Field>
                  </CameraRigProvider>
                </SheetProvider>
              </GridContext.Provider>
            </Canvas>
          </ApplicationContext.Provider>
        </ApplicationProvider>
      </PWAProvider>
    </ServiceWorkerProvider>
  );
};

const AnimationSequence = () => {
  const { cameraControls } = useContext(CameraRigContext);

  useEffect(() => {
    cameraControls.setPosition(0, 100, 0, false);
    cameraControls.setLookAt(0, 10, 120, 0, 0, -20, true);
  }, [cameraControls]);

  return null;
};

const HomePWATakeover = () => {
  const store = useContext(PWAContext);
  const { installable } = useStore(store, {
    keys: ['installable'],
  });

  useEffect(() => {
    setTimeout(() => {
      if (installable) {
        store.setKey('forceInstall', true);
      }
    }, 3000);
  }, []);

  return (
    <PWAInstallTakeover>
      <PWATakeoverContents />
      <PWANotInstallable>
        You can't install strikers on this device.
      </PWANotInstallable>
    </PWAInstallTakeover>
  );
};
