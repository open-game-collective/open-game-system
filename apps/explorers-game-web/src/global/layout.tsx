// import type {
//   LayoutProps,
//   RouteName,
//   RouteProps,
// } from '@explorers-club/schema';
// import { Atom, WritableAtom, atom } from 'nanostores';
// import { FC, ReactNode, createContext, useMemo, useState } from 'react';

// export const LayoutContext = createContext(
//   {} as {
//     isMenuOpenStore: WritableAtom<boolean>;
//     isMainSceneFocusedStore: WritableAtom<boolean>;
//     isMainPanelFocusedStore: WritableAtom<boolean>;
//   }
// );

// export const LayoutProvider: FC<{
//   children: ReactNode;
//   routeStore: Atom<RouteProps>;
// }> = ({ children, routeStore }) => {
//   const defaults = useMemo(
//     () => defaultLayoutPropsByRoute[routeStore.get().name],
//     [routeStore]
//   );

//   const [isMenuOpenStore] = useState(() => {
//     return atom<boolean>(false);
//   });
//   const [isMainPanelFocusedStore] = useState(() => {
//     return atom<boolean>(defaults.focusArea === 'MainScene');
//   });
//   const [isMainSceneFocusedStore] = useState(() => {
//     return atom<boolean>(defaults.focusArea === 'MainPanel');
//   });

//   return (
//     <LayoutContext.Provider
//       value={{
//         isMenuOpenStore,
//         isMainPanelFocusedStore,
//         isMainSceneFocusedStore,
//       }}
//     >
//       {children}
//     </LayoutContext.Provider>
//   );
// };

// const defaultLayoutPropsByRoute: Record<RouteName, LayoutProps> = {
//   Uninitialized: {},
//   Home: {},
//   NewRoom: {
//     focusArea: 'MainPanel',
//   },
//   Login: {
//     focusArea: 'MainPanel',
//   },
//   Room: {},
//   NotFound: {},
// };
