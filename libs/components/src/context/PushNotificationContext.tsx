import { useStore } from '@nanostores/react';
import { assert, noop } from '@explorers-club/utils';
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
import { ConnectionEntity, UserEntity } from '@schema/types';

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
  const { entityStoreRegistry, entitiesById } = useContext(WorldContext);
  const swReg = useStore(serviceWorker$);

  useLayoutEffect(() => {
    if (swReg) {
      (async () => {
        const refresh = async () => {
          const connectionEntity = await waitForStoreValue<ConnectionEntity>(
            entityStoreRegistry.myConnectionEntity,
            10000
          );

          const permissionState = await swReg.pushManager.permissionState({
            userVisibleOnly: true,
          });
          if (permissionState) {
            $.setKey('permissionState', permissionState);
            connectionEntity.send({
              type: 'UPDATE_PERMISSION',
              permission: {
                type: 'NOTIFICATIONS',
                value: permissionState,
              },
            });
          }

          const pushSubscription = await swReg.pushManager.getSubscription();
          if (pushSubscription) {
            const sessionEntity = entityStoreRegistry.mySessionEntity.get();
            assert(sessionEntity, 'expected sessionEntity');

            const userEntity = entitiesById.get(sessionEntity.userId) as
              | UserEntity
              | undefined;
            assert(userEntity, 'expected userEntity');
            console.log({ pushSubscription });

            userEntity.send({
              type: 'REGISTER_PUSH_SUBSCRIPTION',
              json: pushSubscription.toJSON(),
            });
          }
        };
        refresh().then(noop);

        const showOSPrompt = async () => {
          const connectionEntity = entityStoreRegistry.myConnectionEntity.get();
          assert(connectionEntity, 'expected connectionEntity');

          try {
            const subscription = await swReg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey,
            });
          } catch (ex) {
            console.warn('error trying to subscribe', ex);
          }
          await refresh();
        };
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
