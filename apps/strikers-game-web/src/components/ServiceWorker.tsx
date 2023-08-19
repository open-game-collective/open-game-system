import { atom } from 'nanostores';
import { FC, ReactNode, createContext, useLayoutEffect } from 'react';

const swRegStore = atom<ServiceWorkerRegistration | undefined>(undefined);

export const ServiceWorkerContext = createContext({} as typeof swRegStore);

export const ServiceWorkerProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  useLayoutEffect(() => {
    console.log('Reg0');
    navigator.serviceWorker.register('/sw.js').then((swReg) => {
      console.log('Reg1');
      swRegStore.set(swReg);
    });
  }, [swRegStore]);

  return (
    <ServiceWorkerContext.Provider value={swRegStore}>
      {children}
    </ServiceWorkerContext.Provider>
  );
};
