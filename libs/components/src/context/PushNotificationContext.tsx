import { useStore } from '@nanostores/react';
import assert from 'assert';
import { map } from 'nanostores';
import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useLayoutEffect,
} from 'react';
import { ServiceWorkerContext } from './ServiceWorkerContext';
import { WorldContext } from './WorldProvider';

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

        const showOSPrompt = async () => {
          try {
            const pushSubscription = await swReg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey,
            });
            const permissionState = await swReg.pushManager.permissionState({
              userVisibleOnly: true,
            });
            $.setKey('permissionState', permissionState);

            const connectionEntity =
              entityStoreRegistry.myConnectionEntity.get();
            assert(connectionEntity, 'expected connectionEntity');
            connectionEntity.send({
              type: 'REGISTER_PUSH_SUBSCRIPTION',
              json: pushSubscription.toJSON(),
            });
          } catch (ex) {
            console.warn('couldnt subscribe');
            // todo ahndle better
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
