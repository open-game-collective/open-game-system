import { map } from 'nanostores';
import { FC, ReactNode, createContext, useLayoutEffect } from 'react';
import { getPlatformInfo } from './Platform.utils';

enum UserChoice {
  ACCEPTED = 'accepted',
  DISMISSED = 'dismissed',
}

interface BeforeInstallPromptEvent extends Event {
  readonly userChoice: Promise<{
    outcome: UserChoice;
    platform: string;
  }>;

  prompt(): Promise<void>;
}

const { isInPWA } = getPlatformInfo(navigator.userAgent);

const pwaStore = map({
  /**
   * When true, forces the PWA Install takeover to be open
   */
  forceInstall: false,

  /**
   * Whether the application is installed or not
   */
  installed: isInPWA,

  /**
   * When populated, the app can launch a dialog to install
   * Not always guaranteed to be there, usually comes in about
   * 30s in to page interaction.
   */
  install: undefined as (() => void) | undefined,
});

export const PWAContext = createContext({} as typeof pwaStore);

export const PWAProvider: FC<{
  children: ReactNode;
  store?: typeof pwaStore;
}> = ({ children, store }) => {
  const $ = store || pwaStore;

  useLayoutEffect(() => {
    if ('onbeforeinstallprompt' in window) {
      window.addEventListener('appinstalled', (e) => {
        $.setKey('installed', true);
        $.setKey('forceInstall', false);
      });

      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        $.setKey('install', () => {
          const event = e as BeforeInstallPromptEvent;
          event.prompt();
        });
      });
    }
  }, []);

  return <PWAContext.Provider value={$}>{children}</PWAContext.Provider>;
};

// export const PWAInstallTakeover: FC<{ children: ReactNode }> = ({
//   children,
// }) => {
//   const pwaStore = useContext(PWAContext);
//   const { forceInstall } = useStore(pwaStore, {
//     keys: ['forceInstall'],
//   });

//   return forceInstall ? <>{children}</> : null;
// };

// const PWANotInstallable: FC<{ children: ReactNode }> = ({
//   children,
// }) => {
//   const platformStore = useContext(PlatformContext);
//   const { features } = useStore(platformStore);

//   return !features.canInstall ? <>{children}</> : null;
// };

// const bounce = keyframes({
//   '0%, 100%': { transform: 'translateY(0)' },
//   '50%': { transform: 'translateY(-15px)' },
// });

// const PWAInstallViaA2HSAttentionPulse: FC<{
//   css?: CSS;
//   direction?: 'up' | 'down';
// }> = ({ css, direction }) => {
//   return (
//     <Box
//       css={{
//         position: 'absolute',
//         bottom: '$2',
//         display: 'flex',
//         justifyContent: 'center',
//         left: 0,
//         right: 0,
//         ...css,
//       }}
//     >
//       <Box
//         css={{
//           animation: `${bounce} 2s ease-in-out infinite`,
//         }}
//       >
//         {direction === 'up' ? (
//           <ThickArrowUpIcon color="white" />
//         ) : (
//           <ThickArrowDownIcon color="white" />
//         )}
//       </Box>
//     </Box>
//   );
// };

// const PWATakeoverContents = () => {
//   const platformStore = useContext(PlatformContext);
//   const { platformInfo, features } = useStore(platformStore);
//   const { isIOSFirefox, isIOSSafari, isIOSChrome, isChrome } = platformInfo;
//   const pwaStore = useContext(PWAContext);
//   const { installed } = useStore(pwaStore);
//   const { canInstall } = features;

//   return !installed ? (
//     <TakeoverContents
//       css={{
//         display: 'flex',
//         padding: '$4',
//         paddingTop: '$8',
//         flexDirection: 'column',
//         alignItems: 'top',
//         justifyContent: 'flex-start',
//         background: 'rgba(0,0,0,.7)',
//       }}
//     >
//       {canInstall && isIOSSafari && <PWAInstallA2HSSafari />}
//       {canInstall && isIOSFirefox && <PWAInstallA2HSFirefox />}
//       {canInstall && isIOSChrome && <PWAInstallA2HSChrome />}
//       {canInstall && !isIOSChrome && isChrome && <PWAInstallPromptChrome />}
//       {!canInstall && <PWABrowserNotCompatible />}
//     </TakeoverContents>
//   ) : null;
// };

// const PWABrowserNotCompatible = () => (
//   <Box>
//     <Heading>Browser Not Compatible</Heading>
//     <Text>This game is not supported in this browser. </Text>
//     <Text>
//       To play on a desktop computer, try using Google Chrome or Micrsoft Edge
//       browser.
//     </Text>
//     <Text>On iOS device use Safari and ensure iOS is version 16.4+</Text>
//     <Text>On Android use Chrome</Text>
//   </Box>
// );

// const PWAInstallPromptChrome = () => {
//   const store = useContext(PWAContext);
//   const { install } = useStore(store, { keys: ['install'] });

//   return (
//     <Box
//       css={{
//         padding: '$2',
//         display: 'flex',
//         background: 'white',
//         borderRadius: '$3',
//         flexDirection: 'column',
//         gap: '$2',
//       }}
//     >
//       <Heading>Add To Home Screen</Heading>
//       <Text>This game must be added to your home screen in order to play.</Text>
//       {!install ? (
//         <>
//           <Text>
//             1. Press the install{' '}
//             <pre
//               style={{
//                 display: 'inline-flex',
//                 border: '1px solid blue',
//                 alignItems: 'center',
//                 borderRadius: '4px',
//                 padding: '5x',
//               }}
//             >
//               <IconButton>
//                 <DownloadIcon />
//               </IconButton>
//             </pre>{' '}
//             button in your address bar.
//           </Text>
//           <Text>2. Open the game</Text>
//         </>
//       ) : (
//         <Button onClick={install}>Install</Button>
//       )}
//     </Box>
//   );
// };

// const PWAInstallA2HSFirefox = () => (
//   <>
//     <PWAInstallViaA2HSAttentionPulse
//       css={{
//         right: '$4',
//         alignItems: 'end',
//       }}
//     />
//     <Box
//       css={{
//         padding: '$2',
//         display: 'flex',
//         background: 'white',
//         borderRadius: '$3',
//         flexDirection: 'column',
//         gap: '$2',
//       }}
//     >
//       <Heading>Add To Home Screen</Heading>
//       <Text>
//         This game must be added to your home screen in order to play.
//         <br />
//         Follow these steps:
//       </Text>
//       <Box css={{ display: 'flex', flexDirection: 'row' }}>
//         <Text>
//           1. Press the{' '}
//           <pre
//             style={{
//               display: 'inline-flex',
//               border: '1px solid blue',
//               alignItems: 'center',
//               borderRadius: '4px',
//               padding: '5x',
//             }}
//           >
//             <IconButton>
//               <HamburgerMenuIcon />
//             </IconButton>
//           </pre>{' '}
//           button on the menu bar below.
//         </Text>
//       </Box>
//       <Box css={{ display: 'flex', flexDirection: 'row' }}>
//         <Text>
//           2. Press
//           <pre
//             style={{
//               border: '1px solid blue',
//               display: 'inline-flex',
//               alignItems: 'center',
//               borderRadius: '4px',
//               padding: '5x',
//               paddingLeft: '10px',
//             }}
//           >
//             Share
//             <IconButton>
//               <Share2Icon />
//             </IconButton>
//           </pre>{' '}
//         </Text>
//       </Box>
//       <Box css={{ display: 'flex', flexDirection: 'row' }}>
//         <Text>
//           3. Press the{' '}
//           <pre
//             style={{
//               border: '1px solid blue',
//               display: 'inline-flex',
//               alignItems: 'center',
//               borderRadius: '4px',
//               padding: '5x',
//               paddingLeft: '10px',
//             }}
//           >
//             Add to Home Screen
//             <IconButton>
//               <PlusIcon />
//             </IconButton>
//           </pre>{' '}
//           button
//         </Text>
//       </Box>
//     </Box>
//   </>
// );

// const PWAInstallA2HSChrome = () => (
//   <>
//     <PWAInstallViaA2HSAttentionPulse
//       direction="up"
//       css={{
//         top: '$5',
//         right: '$5',
//         justifyContent: 'end',
//         alignItems: 'start',
//       }}
//     />
//     <Box
//       css={{
//         padding: '$2',
//         display: 'flex',
//         background: 'white',
//         borderRadius: '$3',
//         flexDirection: 'column',
//         gap: '$2',
//       }}
//     >
//       <Heading>Add To Home Screen</Heading>
//       <Text>
//         This game must be added to your home screen in order to play.
//         <br />
//         Follow these steps:
//       </Text>
//       <Box css={{ display: 'flex', flexDirection: 'row' }}>
//         <Text>
//           1. Press the{' '}
//           <pre
//             style={{
//               display: 'inline-flex',
//               border: '1px solid blue',
//               alignItems: 'center',
//               borderRadius: '4px',
//               padding: '5x',
//               paddingLeft: '10px',
//             }}
//           >
//             Share
//             <IconButton>
//               <Share2Icon />
//             </IconButton>
//           </pre>{' '}
//           button on the menu bar below.
//         </Text>
//       </Box>
//       <Box css={{ display: 'flex', flexDirection: 'row' }}>
//         <Text>
//           2. Press the{' '}
//           <pre
//             style={{
//               border: '1px solid blue',
//               display: 'inline-flex',
//               alignItems: 'center',
//               borderRadius: '4px',
//               padding: '5x',
//               paddingLeft: '10px',
//             }}
//           >
//             Add to Home Screen
//             <IconButton>
//               <PlusIcon />
//             </IconButton>
//           </pre>{' '}
//           button
//         </Text>
//       </Box>
//     </Box>
//   </>
// );

// const PWAInstallA2HSSafari = () => (
//   <>
//     <PWAInstallViaA2HSAttentionPulse />
//     <Box
//       css={{
//         padding: '$2',
//         display: 'flex',
//         background: 'white',
//         borderRadius: '$3',
//         flexDirection: 'column',
//         gap: '$2',
//       }}
//     >
//       <Heading>Add To Home Screen</Heading>
//       <Text>
//         This game must be added to your home screen in order to play.
//         <br />
//         Follow these steps:
//       </Text>
//       <Box css={{ display: 'flex', flexDirection: 'row' }}>
//         <Text>
//           1. Press the{' '}
//           <pre
//             style={{
//               display: 'inline-flex',
//               border: '1px solid blue',
//               alignItems: 'center',
//               borderRadius: '4px',
//               padding: '5x',
//               paddingLeft: '10px',
//             }}
//           >
//             Share
//             <IconButton>
//               <Share2Icon />
//             </IconButton>
//           </pre>{' '}
//           button on the menu bar below.
//         </Text>
//       </Box>
//       <Box css={{ display: 'flex', flexDirection: 'row' }}>
//         <Text>
//           2. Press the{' '}
//           <pre
//             style={{
//               border: '1px solid blue',
//               display: 'inline-flex',
//               alignItems: 'center',
//               borderRadius: '4px',
//               padding: '5x',
//               paddingLeft: '10px',
//             }}
//           >
//             Add to Home Screen
//             <IconButton>
//               <PlusIcon />
//             </IconButton>
//           </pre>{' '}
//           button
//         </Text>
//       </Box>
//     </Box>
//   </>
// );
