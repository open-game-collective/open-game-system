import { atom } from 'nanostores';
import { FC, ReactNode, createContext, useLayoutEffect } from 'react';

const swRegStore = atom<ServiceWorkerRegistration | undefined>(undefined);

export const ServiceWorkerContext = createContext(swRegStore);

export const ServiceWorkerProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  useLayoutEffect(() => {
    navigator.serviceWorker.register('/sw.js').then((swReg) => {
      swRegStore.set(swReg);
    });
  }, [swRegStore]);

  return (
    <ServiceWorkerContext.Provider value={swRegStore}>
      {children}
    </ServiceWorkerContext.Provider>
  );
};
