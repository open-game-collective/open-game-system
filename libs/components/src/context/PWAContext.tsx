import { Box } from '@atoms/Box';
import { Button } from '@atoms/Button';
import { Heading } from '@atoms/Heading';
import { IconButton } from '@atoms/IconButton';
import { Text } from '@atoms/Text';
import { keyframes } from '@explorers-club/styles';
import { getPlatformInfo } from '@explorers-club/utils';
import { TakeoverContents } from '@molecules/Takeover';
import { useStore } from '@nanostores/react';
import {
  DownloadIcon,
  PlusIcon,
  Share2Icon,
  ThickArrowDownIcon,
} from '@radix-ui/react-icons';
import { map } from 'nanostores';
import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useLayoutEffect,
} from 'react';
import { WorldContext } from './WorldProvider';

enum UserChoice {
  ACCEPTED = 'accepted',
  DISMISSED = 'dismissed',
}

interface BeforeInstallPromptEvent extends Event {
  readonly userChoice: Promise<{
    outcome: UserChoice;
    platform: string;
  }>;

  prompt(): Promise<void>;
}

const { isInPWA, isPWACompatible } = getPlatformInfo();

const pwaStore = map({
  /**
   * When true, forces the PWA Install takeover to be open
   */
  forceInstall: false,

  /**
   * Whether the application is installed or not
   */
  installed: isInPWA,

  /**
   * Whether the application can be installed
   */
  installable: !isInPWA && isPWACompatible,

  /**
   * When populated, the app can launch a dialog to install
   * Not always guaranteed to be there, usually comes in about
   * 30s in to page interaction.
   */
  install: undefined as (() => void) | undefined,
});

export const PWAContext = createContext({} as typeof pwaStore);

export const PWAProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { entityStoreRegistry } = useContext(WorldContext);
  const { forceInstall, installable } = useStore(pwaStore, {
    keys: ['forceInstall', 'installable'],
  });
  useLayoutEffect(() => {
    if ('onbeforeinstallprompt' in window) {
      window.addEventListener('appinstalled', (e) => {
        pwaStore.setKey('installed', true);
        pwaStore.setKey('installable', false);
        pwaStore.setKey('forceInstall', false);
      });

      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        pwaStore.setKey('install', () => {
          const event = e as BeforeInstallPromptEvent;
          event.prompt();
        });
      });
    } else {
      pwaStore.setKey('installable', isPWACompatible);
    }
  }, []);

  return <PWAContext.Provider value={pwaStore}>{children}</PWAContext.Provider>;
};

export const PWAInstallTakeover: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const pwaStore = useContext(PWAContext);
  const { forceInstall } = useStore(pwaStore, {
    keys: ['forceInstall'],
  });

  return forceInstall ? <>{children}</> : null;
};

export const PWANotInstallable: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const pwaStore = useContext(PWAContext);
  const { installable } = useStore(pwaStore, {
    keys: ['installable'],
  });

  return !installable ? <>{children}</> : null;
};

const bounce = keyframes({
  '0%, 100%': { transform: 'translateY(0)' },
  '50%': { transform: 'translateY(-15px)' },
});

const PWAInstallViaA2HSAttentionPulse = () => {
  return (
    <Box
      css={{
        position: 'absolute',
        bottom: '$2',
        display: 'flex',
        justifyContent: 'center',
        left: 0,
        right: 0,
      }}
    >
      <Box
        css={{
          animation: `${bounce} 2s ease-in-out infinite`,
        }}
      >
        <ThickArrowDownIcon color="white" />
      </Box>
    </Box>
  );
};

export const PWATakeoverContents = () => {
  const { isPWACompatible, isMobileSafari } = getPlatformInfo();

  return (
    <TakeoverContents
      css={{
        display: 'flex',
        padding: '$4',
        paddingTop: '$8',
        flexDirection: 'column',
        alignItems: 'top',
        justifyContent: 'flex-start',
        background: 'rgba(0,0,0,.7)',
      }}
    >
      {isPWACompatible && isMobileSafari && <PWAInstallA2HSSafari />}
      {isPWACompatible && !isMobileSafari && <PWAInstallPromptGeneric />}
      {!isPWACompatible && <PWABrowserNotCompatible />}
    </TakeoverContents>
  );
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

const PWAInstallPromptGeneric = () => {
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
