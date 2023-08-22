// Takeover.tsx
import React from 'react';

export type TakeoverId = 'PushNotification' | 'Unsupported' | 'PWAInstall';

interface TakeoverProps {
  id: TakeoverId;
  children: React.ReactNode;
}

export const Takeover: React.FC<TakeoverProps> = ({ children }) => {
  return <>{children}</>;
};
