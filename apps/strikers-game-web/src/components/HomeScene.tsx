import { SunsetSky } from '@3d/sky';
import { Box } from '@atoms/Box';
import { Button } from '@atoms/Button';
import { Heading } from '@atoms/Heading';
import { IconButton } from '@atoms/IconButton';
import { Text } from '@atoms/Text';
import { ApplicationContext } from '@context/ApplicationContext';
import { ApplicationProvider } from '@context/ApplicationProvider';
import {
  PWAContext,
  PWAInstallTakeover,
  PWAInstallTrigger,
  PWAProvider,
} from '@context/PWAContext';
import { TakeoverContents } from '@molecules/Takeover';
import { useStore } from '@nanostores/react';
import { PlusIcon, Share2Icon } from '@radix-ui/react-icons';
import { Canvas } from '@react-three/fiber';
import { CameraRigControls } from '@strikers/client/components/camera-rig-controls';
import {
  CameraRigContext,
  CameraRigProvider,
} from '@strikers/client/components/camera-rig.context';
import { Field } from '@strikers/client/components/field';
import { Goal } from '@strikers/client/components/goal';
import { GridContext } from '@strikers/client/context/grid.context';
import { getProject } from '@theatre/core';
import { SheetProvider } from '@theatre/r3f';
import extension from '@theatre/r3f/dist/extension';
import studio from '@theatre/studio';
import { Grid, defineHex, rectangle } from 'honeycomb-grid';
import { atom } from 'nanostores';
import { FC, useCallback, useContext, useEffect, useState } from 'react';
import { Vector3 } from 'three';
import type { MiddlewareProps } from '../middleware';
import { PushService } from './PushServiceWorker';
import { ServiceWorkerProvider } from './ServiceWorker';

studio.initialize();
studio.extend(extension);

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

  const handlePlay = useCallback(() => {
    sheet.sequence.position = 0;
    sheet.sequence.attachAudio({ source: '/strikers_intro.mp3' }).then(() => {
      sheet.sequence.play();
      // console.log("audio context loaded")
    });
  }, [sheet]);

  return (
    <ServiceWorkerProvider>
      <PWAProvider>
        <HomePWATakeover />
        <ApplicationProvider trpcUrl={trpcUrl} connectionId={connectionId}>
          <ApplicationContext.Provider value={{ routeStore }}>
            <Button
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
            </Button>
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
                    {/* <PerspectiveCamera
          attachArray={undefined}
          attachObject={undefined}
          attachFns={undefined}
          theatreKey={'Camera'}
        /> */}
                    <AnimationSequence />
                    <SunsetSky />
                    <CameraRigControls />
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
  const { displayMode, installable } = useStore(store, {
    keys: ['displayMode', 'installable'],
  });
  console.log({ installable });

  useEffect(() => {
    setTimeout(() => {
      if (displayMode !== 'standalone') {
        store.setKey('forceInstall', true);
      }
    }, 3000);
  }, []);

  return installable ? (
    <PWAInstallTakeover>
      <PWATakeoverContents />
    </PWAInstallTakeover>
  ) : null;
};

const PWATakeoverContents = () => {
  const store = useContext(PWAContext);
  const { installable } = useStore(store, { keys: ['installable'] });

  return (
    <TakeoverContents
      css={{
        display: 'flex',
        padding: '$4',
        paddingTop: '$8',
        flexDirection: 'column',
        alignItems: 'top',
        justifyContent: 'center',
        background: '#fefefe',
      }}
    >
      <Heading>Get Notified</Heading>
      <Text>
        This website has notifications. Add it to your home screen to enable.
      </Text>
      <Box css={{ display: 'flex', flexDirection: 'row' }}>
        <Text>
          1. Press the{' '}
          <pre
            style={{
              display: 'inline-flex',
              border: '1px solid blue',
              alignItems: 'center',
              borderRadius: '4px',
              padding: '5x',
              paddingRight: '12px',
            }}
          >
            <IconButton>
              <Share2Icon />
            </IconButton>
            Share
          </pre>{' '}
          button on the menu bar below.
        </Text>
      </Box>
      <Box css={{ display: 'flex', flexDirection: 'row' }}>
        <Text>
          2. Press the{' '}
          <pre
            style={{
              border: '1px solid blue',
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: '4px',
              padding: '5x',
              paddingRight: '12px',
            }}
          >
            <IconButton>
              <PlusIcon />
            </IconButton>
            Add to Home Screen
          </pre>{' '}
          button
        </Text>
      </Box>
      {installable && <PWAInstallTrigger>Install</PWAInstallTrigger>}
    </TakeoverContents>
  );
};
