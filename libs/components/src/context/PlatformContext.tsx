import { FC, ReactNode, createContext, useLayoutEffect } from 'react';
import { getFeatures, getPlatformInfo } from './Platform.utils';
import { map, listenKeys } from 'nanostores';

export const platformStore = map({
  userAgent: navigator.userAgent,
  features: getFeatures(navigator.userAgent),
  platformInfo: getPlatformInfo(navigator.userAgent),
  refresh: () => {
    platformStore.setKey("features", getFeatures(navigator.userAgent));
    platformStore.setKey("platformInfo", getPlatformInfo(navigator.userAgent));
  },
});

export const PlatformContext = createContext(platformStore);

export const PlatformProvider: FC<{
  children: ReactNode;
  store?: typeof platformStore;
}> = ({ children, store }) => {

  const value = store || platformStore;
  useLayoutEffect(() => {
    listenKeys(value, ["userAgent"],  platformStore.get().refresh);
  }, [value])

  return (
    <PlatformContext.Provider value={value}>
      {children}
    </PlatformContext.Provider>
  );
};
