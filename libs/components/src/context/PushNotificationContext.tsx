import { useStore } from '@nanostores/react';
import assert from 'assert';
import { listenKeys, map } from 'nanostores';
import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useLayoutEffect,
} from 'react';
import { ServiceWorkerContext } from './ServiceWorkerContext';
import { WorldContext } from './WorldProvider';
import { waitForStoreValue } from '@explorers-club/utils';
import { ConnectionEntity } from '@schema/types';

export const pushNotificationStore = map({
  permissionState: undefined as undefined | PermissionState,
  showPushPermissionTakeover: false,
  showOSPrompt: undefined as (() => void) | undefined,
});

export const PushNotificationContext = createContext(pushNotificationStore);

export const PushNotificationProvider: FC<{
  children: ReactNode;
  store?: typeof pushNotificationStore;
  applicationServerKey: string;
}> = ({ children, store, applicationServerKey }) => {
  const $ = store || pushNotificationStore;

  const serviceWorker$ = useContext(ServiceWorkerContext);
  const { entityStoreRegistry } = useContext(WorldContext);
  const swReg = useStore(serviceWorker$);

  useLayoutEffect(() => {
    if (swReg) {
      (async () => {
        const permissionState = await swReg.pushManager.permissionState({
          userVisibleOnly: true,
        });

        listenKeys($, ['permissionState'], async ({ permissionState }) => {
          if (!permissionState) {
            return;
          }

          const connectionEntity = await waitForStoreValue<ConnectionEntity>(
            entityStoreRegistry.myConnectionEntity,
            10000
          );

          connectionEntity.send({
            type: 'UPDATE_PERMISSION',
            permission: {
              type: 'NOTIFICATIONS',
              value: permissionState,
            },
          });
        });

        const showOSPrompt = async () => {
          const connectionEntity = entityStoreRegistry.myConnectionEntity.get();
          assert(connectionEntity, 'expected connectionEntity');

          try {
            const permissionState = await swReg.pushManager.permissionState({
              userVisibleOnly: true,
            });

            $.setKey('permissionState', permissionState);

            if (permissionState === 'granted') {
              const pushSubscription = await swReg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey,
              });

              connectionEntity.send({
                type: 'REGISTER_PUSH_SUBSCRIPTION',
                json: pushSubscription.toJSON(),
              });
            }
          } catch (ex) {
            const permissionState = await swReg.pushManager.permissionState({
              userVisibleOnly: true,
            });
            $.setKey('permissionState', permissionState);
          }
        };

        $.setKey('permissionState', permissionState);
        $.setKey('showOSPrompt', showOSPrompt);
      })();
    }
  }, [swReg]);

  return (
    <PushNotificationContext.Provider value={$}>
      {children}
    </PushNotificationContext.Provider>
  );
};
