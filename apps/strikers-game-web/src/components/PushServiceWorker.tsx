import { ConnectionContext } from '@context/ApplicationProvider';
import { noop } from '@explorers-club/utils';
import { FC, useContext, useEffect } from 'react';

const serviceWorkerBundleUrl = 'http://127.0.0.1/index.js';

export const PushServiceWorker = () => {
  const connectionEntity = useContext(ConnectionContext);
  useEffect(() => {
    if (supportsPushNofications()) {
      requestPushNofications(serviceWorkerBundleUrl).then(noop);
    }
  }, [serviceWorkerBundleUrl]);

  return null;
};

// Check if the browser supports push notifications.
const supportsPushNofications = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

const requestPushNofications = async (serviceWorkerUrl: string) => {
  const swReg = await navigator.serviceWorker.register('/sw.js');

  // Subscribe for push notifications.
  const pushSubscription = await swReg.pushManager.subscribe({
    userVisibleOnly: true,
  });

  pushSubscription.toJSON();
  console.log(pushSubscription.toJSON());
};
