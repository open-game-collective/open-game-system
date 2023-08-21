import { Box } from '@atoms/Box';
import { Button } from '@atoms/Button';
import { Heading } from '@atoms/Heading';
import { Text } from '@atoms/Text';
import { PlatformContext } from '@context/PlatformContext';
import { PushNotificationContext } from '@context/PushNotificationContext';
import { assert } from '@explorers-club/utils';
import { useStore } from '@nanostores/react';
import { ThickArrowDownIcon } from '@radix-ui/react-icons';
import { FC, useCallback, useContext } from 'react';
import { keyframes, type CSS } from '../stitches.config';

export const PushNotificationScreen: FC<{ css?: CSS }> = ({ css }) => {
  const push$ = useContext(PushNotificationContext);
  const platform$ = useContext(PlatformContext);
  const { features } = useStore(platform$);

  const { permissionState } = useStore(push$);

  if (!permissionState) {
    // Initializing...
    return null;
  }

  if (!features.hasPush) {
    return null;
  }

  if (permissionState === 'denied') {
    return <PushPermissionsDenied />;
  }

  if (permissionState === 'prompt') {
    return <PushNotificationsTakeoverContents />;
  }

  return null;
};

const PushPermissionsDenied = () => {
  const handlePressSkip = useCallback(() => {
    console.log('skip');
  }, []);

  return (
    <Box>
      <Heading>Notifications Not Enabled</Heading>
      <Text>
        Enable notifications to get alerts when it's your turn to play.
      </Text>
      <Button onClick={handlePressSkip}>Skip</Button>
    </Box>
  );
};

const PushNotificationsTakeoverContents = () => {
  const store$ = useContext(PushNotificationContext);
  const { showOSPrompt: showPrompt } = useStore(store$);

  const handleOnClick = useCallback(() => {
    assert(showPrompt, 'expected showPrompt');
    showPrompt();
  }, [showPrompt]);

  return (
    <Box>
      <Text>Enable push notifications to proceed</Text>
      <Button onClick={handleOnClick}>Continue</Button>
    </Box>
  );
};

const bounce = keyframes({
  '0%, 100%': { transform: 'translateY(0)' },
  '50%': { transform: 'translateY(-15px)' },
});

const SafariButtonAttentionPulse = () => {
  return (
    <Box
      css={{
        position: 'absolute',
        bottom: '$2',
        display: 'flex',
        justifyContent: 'center',
        right: '$3',
      }}
    >
      <Box
        css={{
          animation: `${bounce} 2s ease-in-out infinite`,
        }}
      >
        <ThickArrowDownIcon color="white" />
      </Box>
    </Box>
  );
};
