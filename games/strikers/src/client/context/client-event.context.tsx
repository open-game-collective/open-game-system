import { HexCoordinates } from 'honeycomb-grid';
import { Atom, atom } from 'nanostores';
import { FC, ReactNode, createContext } from 'react';

type ClientEvent = {
  type: 'PRESS_TILE';
  position: HexCoordinates;
};

const event$ = atom({} as ClientEvent);

export const ClientEventContext = createContext({
  send: () => {}, // no-op if provider ever not se tup
  event$,
} as { send: (event: ClientEvent) => void; event$: Atom<ClientEvent> });

export const ClientEventProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const send = (event: ClientEvent) => {
    event$.set(event);
  };

  return (
    <ClientEventContext.Provider value={{ send, event$ }}>
      {children}
    </ClientEventContext.Provider>
  );
};
