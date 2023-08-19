import { Box } from '@atoms/Box';
import { assert, getPlatformInfo } from '@explorers-club/utils';
import { Button } from '@atoms/Button';
import { Heading } from '@atoms/Heading';
import { useStore } from '@nanostores/react';
import { map } from 'nanostores';
import {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';

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

const displayMode = window.matchMedia('(display-mode: standalone)').matches
  ? 'standalone'
  : ('browser tab' as const);

// todo do this in component?
if ('onbeforeinstallprompt' in window) {
  console.log('obis');
  window.addEventListener('appinstalled', (e) => {
    pwaStore.setKey('installed', true);
    pwaStore.setKey('installable', false);
  });

  window.addEventListener('beforeinstallprompt', (e) => {
    // not firing, why?
    console.log('before install prompt');
    pwaStore.setKey('installable', true);
    pwaStore.setKey('installPrompt', e as BeforeInstallPromptEvent);
  });
}

const { isInPWA, isPWACompatible } = getPlatformInfo();

const installed = isInPWA;
const installable = !isInPWA && isPWACompatible;

const pwaStore = map({
  /**
   * how the current runtime is being dispalyed (I.e.)
   */
  displayMode: displayMode as 'standalone' | 'browser tab',

  /**
   * When true, forces the PWA Install takeover to be open
   */
  forceInstall: false,

  /**
   * Whether the application is installed or not
   */
  installed,

  /**
   * Whether the application can be installed
   */
  installable,

  /**
   * Holds the reference 'beforeinstallprompt' event that's used
   * in Android/Chrome trigger the install prompt.
   *
   * Primarily used internally within the provider and not meant
   * for outside consumption
   */
  installPrompt: undefined as BeforeInstallPromptEvent | undefined,

  install: () => {},
});

export const PWAContext = createContext({} as typeof pwaStore);

export const PWAProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { forceInstall, installable } = useStore(pwaStore, {
    keys: ['forceInstall', 'installable'],
  });
  useLayoutEffect(() => {
    pwaStore.setKey('install', async () => {
      const { installPrompt } = pwaStore.get();
      assert(installPrompt, 'expected installPrompt but was undefined');

      if (
        'prompt' in installPrompt &&
        typeof installPrompt.prompt === 'function'
      ) {
        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        // todo?
        console.log({ outcome });
      }
    });
  }, []);

  return (
    <PWAContext.Provider value={pwaStore}>
      {installable && forceInstall ? <>{children}</> : <>{children}</>}
    </PWAContext.Provider>
  );
};

export const PWAInstallTrigger: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { install, installPrompt } = useStore(pwaStore, {
    keys: ['install', 'installPrompt'],
  });

  const handlePressCTA = useCallback(() => {
    install();
  }, [install]);

  return installPrompt ? (
    <Button onClick={handlePressCTA}>{children}</Button>
  ) : null;
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
