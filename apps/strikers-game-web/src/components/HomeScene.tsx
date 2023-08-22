import { SunsetSky } from '@3d/sky';
import { ApplicationContext } from '@context/ApplicationContext';
import { ApplicationProvider } from '@context/ApplicationProvider';
import { PWAContext, PWAProvider } from '@context/PWAContext';
import {
  PushNotificationContext,
  PushNotificationProvider,
} from '@context/PushNotificationContext';
import { Takeovers } from '@molecules/Takeovers';
import { useStore } from '@nanostores/react';
import { Canvas } from '@react-three/fiber';
import { PushNotificationScreen } from '@screens/PushNotificationScreen';
import { UnsupportedScreen } from '@screens/UnsupportedScreen';
import { PWAInstallScreen } from '@screens/PWAInstallScreen';
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
import { ServiceWorkerProvider } from '@context/ServiceWorkerContext';
import { Takeover } from '@molecules/Takeover';
import { Grid, defineHex, rectangle } from 'honeycomb-grid';
import { atom } from 'nanostores';
import { FC, useContext, useEffect, useLayoutEffect, useState } from 'react';
import { Vector3 } from 'three';
import type { MiddlewareProps } from '../middleware';
import { PlatformContext } from '@context/PlatformContext';

// studio.initialize();
// studio.extend(extension);
const applicationServerKey = import.meta.env.PUBLIC_VAPID_PUBLIC_KEY;

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

  return (
    <ServiceWorkerProvider>
      <ApplicationProvider trpcUrl={trpcUrl} connectionId={connectionId}>
        <ApplicationContext.Provider value={{ routeStore }}>
          <PWAProvider>
            <PushNotificationProvider
              applicationServerKey={applicationServerKey}
            >
              <PromptForPWAInstall />
              <PromptForPushNotifications />
              <Takeovers>
                <Takeover id="PushNotification">
                  <PushNotificationScreen />
                </Takeover>
                <Takeover id="Unsupported">
                  <UnsupportedScreen />
                </Takeover>
                <Takeover id="PWAInstall">
                  <PWAInstallScreen />
                </Takeover>
              </Takeovers>
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
            </PushNotificationProvider>
          </PWAProvider>
        </ApplicationContext.Provider>
      </ApplicationProvider>
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

const PromptForPushNotifications = () => {
  const push$ = useContext(PushNotificationContext);

  useLayoutEffect(() => {
    push$.setKey('showPushPermissionTakeover', true);

    return () => {
      push$.setKey('showPushPermissionTakeover', false);
    };
  }, [push$]);

  return null;
};

const PromptForPWAInstall = () => {
  const pwa$ = useContext(PWAContext);
  const platform$ = useContext(PlatformContext);
  const { features } = useStore(platform$);

  useLayoutEffect(() => {
    // Only forceInstall if support PWAs but dont support push
    if (features.canInstall && !features.hasPush) {
      pwa$.setKey('forceInstall', true);
    }

    return () => {
      pwa$.setKey('forceInstall', false);
    };
  }, [pwa$]);

  return null;
};
