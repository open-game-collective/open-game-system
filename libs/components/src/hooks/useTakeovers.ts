import { PWAContext } from '@context/PWAContext';
import { PlatformContext } from '@context/PlatformContext';
import { PushNotificationContext } from '@context/PushNotificationContext';
import { TakeoverId } from '@molecules/Takeover';
import { useStore } from '@nanostores/react';
import { useContext } from 'react';

// export type TakeoverId = 'PushNotification' | 'Unsupported' | 'PWAInstall';

export const useTakeovers = () => {
  const platform$ = useContext(PlatformContext);
  const push$ = useContext(PushNotificationContext);
  const pwa$ = useContext(PWAContext);

  const potentialTakeovers: TakeoverId[] = [];

  const { showPushPermissionTakeover, permissionState } = useStore(push$);
  const { installed, forceInstall } = useStore(pwa$);
  const { features, platformInfo } = useStore(platform$);

  if (
    showPushPermissionTakeover &&
    features.hasPush &&
    permissionState !== 'granted'
  ) {
    potentialTakeovers.push('PushNotification');
  }

  if (platformInfo.isUnsupported) {
    potentialTakeovers.push('Unsupported');
  }

  if (!installed && features.canInstall && forceInstall) {
    potentialTakeovers.push('PWAInstall');
  }

  return potentialTakeovers;
};
