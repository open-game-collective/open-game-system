import { Box } from '@atoms/Box';
import { Button, ButtonLink } from '@atoms/Button';
import { Heading } from '@atoms/Heading';
import { Text } from '@atoms/Text';
import { PushNotificationContext } from '@context/PushNotificationContext';
import { assert } from '@explorers-club/utils';
import { useStore } from '@nanostores/react';
import { ThickArrowDownIcon } from '@radix-ui/react-icons';
import { FC, useCallback, useContext } from 'react';
import { keyframes, type CSS } from '../stitches.config';
import { Flex } from '@atoms/Flex';

export const PushNotificationScreen: FC<{ css?: CSS }> = ({ css }) => {
  const push$ = useContext(PushNotificationContext);

  const { permissionState } = useStore(push$);

  if (permissionState === 'denied') {
    return <PushPermissionsDenied />;
  }

  if (permissionState === 'prompt') {
    return <PushNotificationPromptPrimer />;
  }

  return null;
};

const PushPermissionsDenied = () => {
  const handlePressReload = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <Flex css={{ p: '$4', width: '100%' }}>
      <Flex
        css={{
          backgroundColor: '#fff',
          p: '$4',
          width: '100%',
        }}
        direction="column"
        gap={'3'}
      >
        <Heading>Notifications Disabled</Heading>
        <Text>
          To get alerts when it's your turn, enable notifications in your
          browser, then{' '}
          <ButtonLink onClick={handlePressReload}>reload the page</ButtonLink>.
        </Text>
        <img
          alt="chrome notification permissions toggle"
          src={'/static/chrome-notification-permissions.jpg'}
        />
      </Flex>
    </Flex>
  );
};

const PushNotificationPromptPrimer = () => {
  const store$ = useContext(PushNotificationContext);
  const { showOSPrompt: showPrompt } = useStore(store$);

  const handleOnClick = useCallback(() => {
    assert(showPrompt, 'expected showPrompt');
    showPrompt();
  }, [showPrompt]);

  return (
    <Flex css={{ p: '$4', width: '100%' }}>
      <Flex
        css={{
          backgroundColor: '#fff',
          p: '$4',
          width: '100%',
        }}
        direction="column"
        gap={'3'}
      >
        <Heading>Enable Turn Notifications</Heading>
        <Text>Get alerts when it's your turn to play</Text>
        <Button onClick={handleOnClick}>Continue</Button>
      </Flex>
    </Flex>
  );
};

const bounce = keyframes({
  '0%, 100%': { transform: 'translateY(0)' },
  '50%': { transform: 'translateY(-15px)' },
});

// const SafariButtonAttentionPulse = () => {
//   return (
//     <Box
//       css={{
//         position: 'absolute',
//         bottom: '$2',
//         display: 'flex',
//         justifyContent: 'center',
//         right: '$3',
//       }}
//     >
//       <Box
//         css={{
//           animation: `${bounce} 2s ease-in-out infinite`,
//         }}
//       >
//         <ThickArrowDownIcon color="white" />
//       </Box>
//     </Box>
//   );
// };
