import { Box } from '@atoms/Box';
import { Button } from '@atoms/Button';
import { Heading } from '@atoms/Heading';
import { IconButton } from '@atoms/IconButton';
import { Text } from '@atoms/Text';
import { CSS, keyframes } from '@explorers-club/styles';
import { useStore } from '@nanostores/react';
import {
  DownloadIcon,
  HamburgerMenuIcon,
  PlusIcon,
  Share2Icon,
  ThickArrowDownIcon,
  ThickArrowUpIcon,
} from '@radix-ui/react-icons';
import { FC, ReactNode, useContext } from 'react';
import { PWAContext } from '@context/PWAContext';
import { PlatformContext } from '@context/PlatformContext';
import { Flex } from '@atoms/Flex';

export const PWAInstallScreen = () => {
  const pwaStore = useContext(PWAContext);
  const { forceInstall } = useStore(pwaStore, {
    keys: ['forceInstall'],
  });

  if (!forceInstall) {
    return null;
  }

  return (
    <>
      <PWATakeoverContents />
      <PWANotInstallable>
        You can't install strikers on this device.
      </PWANotInstallable>
    </>
  );
};

export const PWANotInstallable: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const platform$ = useContext(PlatformContext);
  const { features } = useStore(platform$);

  return !features.canInstall ? <>{children}</> : null;
};

const bounce = keyframes({
  '0%, 100%': { transform: 'translateY(0)' },
  '50%': { transform: 'translateY(-15px)' },
});

const PWAInstallViaA2HSAttentionPulse: FC<{
  css?: CSS;
  direction?: 'up' | 'down';
}> = ({ css, direction }) => {
  return (
    <Box
      css={{
        position: 'absolute',
        bottom: '$2',
        display: 'flex',
        justifyContent: 'center',
        left: 0,
        right: 0,
        ...css,
      }}
    >
      <Box
        css={{
          animation: `${bounce} 2s ease-in-out infinite`,
        }}
      >
        {direction === 'up' ? (
          <ThickArrowUpIcon color="white" />
        ) : (
          <ThickArrowDownIcon color="white" />
        )}
      </Box>
    </Box>
  );
};

const PWATakeoverContents = () => {
  const platformStore = useContext(PlatformContext);
  const { platformInfo, features } = useStore(platformStore);
  const { isIOSFirefox, isIOSSafari, isIOSChrome, isChrome } = platformInfo;
  const pwaStore = useContext(PWAContext);
  const { installed } = useStore(pwaStore);
  const { canInstall } = features;

  return !installed ? (
    <Flex
      css={{
        padding: '$4',
        paddingTop: '$8',
        flexDirection: 'column',
        alignItems: 'top',
        justifyContent: 'flex-start',
        background: 'rgba(0,0,0,.7)',
      }}
    >
      {canInstall && isIOSSafari && <PWAInstallA2HSSafari />}
      {canInstall && isIOSFirefox && <PWAInstallA2HSFirefox />}
      {canInstall && isIOSChrome && <PWAInstallA2HSChrome />}
      {canInstall && !isIOSChrome && isChrome && <PWAInstallPromptChrome />}
      {!canInstall && <PWABrowserNotCompatible />}
    </Flex>
  ) : null;
};

const PWABrowserNotCompatible = () => (
  <Box>
    <Heading>Browser Not Compatible</Heading>
    <Text>This game is not supported in this browser. </Text>
    <Text>
      To play on a desktop computer, try using Google Chrome or Micrsoft Edge
      browser.
    </Text>
    <Text>On iOS device use Safari and ensure iOS is version 16.4+</Text>
    <Text>On Android use Chrome</Text>
  </Box>
);

const PWAInstallPromptChrome = () => {
  const store = useContext(PWAContext);
  const { install } = useStore(store, { keys: ['install'] });

  return (
    <Box
      css={{
        padding: '$2',
        display: 'flex',
        background: 'white',
        borderRadius: '$3',
        flexDirection: 'column',
        gap: '$2',
      }}
    >
      <Heading>Add To Home Screen</Heading>
      <Text>This game must be added to your home screen in order to play.</Text>
      {!install ? (
        <>
          <Text>
            1. Press the install{' '}
            <pre
              style={{
                display: 'inline-flex',
                border: '1px solid blue',
                alignItems: 'center',
                borderRadius: '4px',
                padding: '5x',
              }}
            >
              <IconButton>
                <DownloadIcon />
              </IconButton>
            </pre>{' '}
            button in your address bar.
          </Text>
          <Text>2. Open the game</Text>
        </>
      ) : (
        <Button onClick={install}>Install</Button>
      )}
    </Box>
  );
};

const PWAInstallA2HSFirefox = () => (
  <>
    <PWAInstallViaA2HSAttentionPulse
      css={{
        right: '$4',
        alignItems: 'end',
      }}
    />
    <Box
      css={{
        padding: '$2',
        display: 'flex',
        background: 'white',
        borderRadius: '$3',
        flexDirection: 'column',
        gap: '$2',
      }}
    >
      <Heading>Add To Home Screen</Heading>
      <Text>
        This game must be added to your home screen in order to play.
        <br />
        Follow these steps:
      </Text>
      <Box css={{ display: 'flex', flexDirection: 'row' }}>
        <Text>
          1. Press
          <pre
            style={{
              display: 'inline-flex',
              border: '1px solid blue',
              alignItems: 'center',
              borderRadius: '4px',
              padding: '5x',
            }}
          >
            <IconButton>
              <HamburgerMenuIcon />
            </IconButton>
          </pre>{' '}
        </Text>
      </Box>
      <Box css={{ display: 'flex', flexDirection: 'row' }}>
        <Text>
          2. Press
          <pre
            style={{
              border: '1px solid blue',
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: '4px',
              padding: '5x',
              paddingLeft: '10px',
            }}
          >
            Share
            <IconButton>
              <Share2Icon />
            </IconButton>
          </pre>{' '}
        </Text>
      </Box>
      <Box css={{ display: 'flex', flexDirection: 'row' }}>
        <Text>
          3. Press the{' '}
          <pre
            style={{
              border: '1px solid blue',
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: '4px',
              padding: '5x',
              paddingLeft: '10px',
            }}
          >
            Add to Home Screen
            <IconButton>
              <PlusIcon />
            </IconButton>
          </pre>{' '}
          button
        </Text>
      </Box>
    </Box>
  </>
);

const PWAInstallA2HSChrome = () => (
  <>
    <PWAInstallViaA2HSAttentionPulse
      direction="up"
      css={{
        top: '$5',
        right: '$5',
        justifyContent: 'end',
        alignItems: 'start',
      }}
    />
    <Box
      css={{
        padding: '$2',
        display: 'flex',
        background: 'white',
        borderRadius: '$3',
        flexDirection: 'column',
        gap: '$2',
      }}
    >
      <Heading>Add To Home Screen</Heading>
      <Text>
        This game must be added to your home screen in order to play.
        <br />
        Follow these steps:
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
              paddingLeft: '10px',
            }}
          >
            Share
            <IconButton>
              <Share2Icon />
            </IconButton>
          </pre>{' '}
          button.
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
              paddingLeft: '10px',
            }}
          >
            Add to Home Screen
            <IconButton>
              <PlusIcon />
            </IconButton>
          </pre>{' '}
          button
        </Text>
      </Box>
    </Box>
  </>
);

const PWAInstallA2HSSafari = () => (
  <>
    <PWAInstallViaA2HSAttentionPulse />
    <Box
      css={{
        padding: '$2',
        display: 'flex',
        background: 'white',
        borderRadius: '$3',
        flexDirection: 'column',
        gap: '$2',
      }}
    >
      <Heading>Add To Home Screen</Heading>
      <Text>
        This game must be added to your home screen in order to play.
        <br />
        Follow these steps:
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
              paddingLeft: '10px',
            }}
          >
            Share
            <IconButton>
              <Share2Icon />
            </IconButton>
          </pre>{' '}
          button.
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
              paddingLeft: '10px',
            }}
          >
            Add to Home Screen
            <IconButton>
              <PlusIcon />
            </IconButton>
          </pre>{' '}
          button
        </Text>
      </Box>
      <img
        style={{ width: '100%', border: "1px solid #ccc", borderRadius: "6px" }}
        src="/static/a2hs_safari.jpg"
        alt="Add to Home Screen Example"
      />
      <Text>
        Tip: if "Add To Home Screen" is not an option, try opening this page in
        Safari.
      </Text>
    </Box>
  </>
);
