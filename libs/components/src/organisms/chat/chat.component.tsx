import { Avatar } from '@atoms/Avatar';
import { Badge } from '@atoms/Badge';
import { Box } from '@atoms/Box';
import { Caption } from '@atoms/Caption';
import { Flex } from '@atoms/Flex';
import { Text } from '@atoms/Text';
import { TextField } from '@atoms/TextField';
import { Entity, SnowflakeId } from '@explorers-club/schema';
import { styled } from '@explorers-club/styles';
import { useEntityIdSelector } from '@hooks/useEntityIdSelector';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import {
  FC,
  FormEventHandler,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ChatContext } from './chat.context';

type PlainMessageEvent = {
  type: 'PLAIN_MESSAGE';
  id: SnowflakeId;
  senderEntityId: SnowflakeId;
  message: string;
};

type ChatEvent = PlainMessageEvent;

export const Chat = () => {
  const { roomEntity, connectionEntity } = useContext(ChatContext);
  console.log({ roomEntity, connectionEntity });
  // const world = useStore(worldStore);
  // const [archetype] = useState(
  //   world.with<ConnectionEntity>('chatService')
  // );
  // const bucket = useEntities(archetype);

  // const entity = bucket.entities.length && bucket.entities[0];
  // if (!entity) {
  //   return <div>Loading</div>;
  // }

  return (
    <Flex direction="column" css={{ width: '100%', minHeight: '100%' }}>
      {/* <Flex css={{ p: '$3' }} justify="between">
        <Caption css={{ flexGrow: 1 }}>Chat</Caption>
        <CountdownTimer />
      </Flex>
      <ChatMessageList />
      <ChatInput disabled={!!disabled} /> */}
      <ChatMessageList />
      <ChatInput disabled={false} />
    </Flex>
  );
};

const ChatInput: FC<{ disabled: boolean }> = ({ disabled }) => {
  const textRef = useRef<HTMLInputElement | null>(null);
  // const send = useLittleVigilanteSend();
  const handleSubmit: FormEventHandler = useCallback(
    (e) => {
      const text = textRef.current?.value || '';
      e.preventDefault();
      if (text !== '') {
        // send({ type: 'MESSAGE', message: { text } });

        // clear input
        if (textRef.current) {
          textRef.current.value = '';
        }
      }
    },
    [textRef]
  );

  const handleChange = useCallback(() => {
    // send({ type: 'TYPING' });
  }, []);

  const handleFocus = useCallback(() => {
    // console.log('hi');
  }, []);

  return (
    <Flex direction="column" css={{ background: '$primary6' }}>
      {/* <ChatSuggestionsSlider /> */}
      <form onSubmit={handleSubmit}>
        <TextField
          disabled={disabled}
          ref={textRef}
          name="text"
          placeholder={!disabled ? 'Enter message' : 'Messages disabled'}
          onChange={handleChange}
          onFocus={handleFocus}
        />
      </form>
    </Flex>
  );
};

const ChatMessageList = () => {
  const scrollViewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isScrolled = false;
    const scrollView = scrollViewRef.current;
    if (!scrollView) {
      return;
    }
    const observer = new ResizeObserver((entries) => {
      console.log('observer');
      scrollView.scrollTo(0, scrollView.scrollHeight);
    });
    observer.observe(scrollView);

    const handleScroll = (e: Event) => {
      if (!scrollView) {
        return;
      }

      const { clientHeight, scrollTop, scrollHeight } = scrollView;

      if (clientHeight + scrollTop === scrollHeight) {
        isScrolled = false;
      } else {
        isScrolled = true;
      }
    };

    // Track if we are scrolled up or not
    // and only jump back to jump if we press
    // scrollView.addEventListener('scroll', handleScroll);

    // const sub = service.subscribe(() => {
    //   if (isScrolled) {
    //     return;
    //   }

    //   if (!scrollView) {
    //     return;
    //   }

    //   const { scrollHeight } = scrollView;

    //   if (!isScrolled) {
    //     setTimeout(() => {
    //       scrollView.scrollTo(0, scrollHeight);
    //     }, 0);
    //   }
    // });
    // scrollView.scrollTo(0, scrollView.scrollHeight);

    // return () => {
    //   sub.unsubscribe();
    //   scrollView?.removeEventListener('scroll', handleScroll);
    // };
  }, [scrollViewRef]);

  const events = [] as ChatEvent[];

  return (
    <Flex
      direction="column"
      gap="1"
      justify="end"
      css={{
        px: '$3',
        py: '$2',
        // height: '200px',
        // minHeight: '100%',
        minHeight: '250px',
        background: '$primary9',
        // flexGrow: 1,
        // position: 'relative',
      }}
    >
      <Flex
        // ref={scrollViewRef}
        direction="column"
        gap="1"
        css={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: -1,
        }}
      >
        <ChatRoot>
          <ChatViewport ref={scrollViewRef}>
            <Flex direction="column" gap="2">
              {events.map((event, index) => (
                <ChatMessage key={event.id} index={index} event={event} />
              ))}
            </Flex>
            <TypingIndicator />
            {/* Anchor from https://css-tricks.com/books/greatest-css-tricks/pin-scrolling-to-bottom/ */}
            {/* <Box css={{ overflowAnchor: 'auto !important', height: '1px' }} /> */}
          </ChatViewport>
          <ChatScrollbar orientation="vertical">
            <ChatScrollThumb />
          </ChatScrollbar>
        </ChatRoot>
      </Flex>
    </Flex>
  );
};
const ChatScrollThumb = styled(ScrollArea.ScrollAreaThumb, {
  flex: 1,
  background: '$primary9',
  borderRadius: '$1',
  position: 'relative',

  '&:before': {
    content: '',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    height: '100%',
    minWidth: '44px',
    minHeight: '44px',
  },
});

const ChatScrollbar = styled(ScrollArea.ScrollAreaScrollbar, {
  display: 'flex',
  userSelect: 'none',
  touchAction: 'none',
  padding: '$1',
  background: '$primary6',
  width: '$2',
  transition: 'background 160ms ease-out',
  '&:hover': {
    background: '$primary8',
  },
});

const ChatRoot = styled(ScrollArea.Root, {
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  '--scrollbar-size': '10px',
});

const ChatViewport = styled(ScrollArea.Viewport, {
  width: '100%',
  height: '100%',
  p: '$3',
  boxSizing: 'border-box',
});

const TypingIndicator = () => {
  const [currentlyTyping, setCurrentlyTyping] = useState<string[]>([]);
  const typingUserRef = useRef<Partial<Record<string, number>>>({});

  // const event$ = useLittleVigilanteEvent$();

  if (!currentlyTyping.length) {
    return null;
  }

  const typers = currentlyTyping.map((userId) => ({
    name: userId,
  }));

  return (
    <Flex justify="center" align="center">
      <Caption>
        {typers.map(({ name }) => (
          <Badge>{name}</Badge>
        ))}{' '}
        typing
      </Caption>
      {/* <Caption>{names.join(', ')} typing</Caption> */}
    </Flex>
  );
};

const ChatMessage: FC<{ event: ChatEvent; index: number }> = ({
  event,
  index,
}) => {
  switch (event.type) {
    case 'PLAIN_MESSAGE':
      return <PlainMessage event={event} index={index} />;
    // case 'JOIN':
    //   return <JoinMessage event={event} />;
    // case 'RESUME':
    //   return <ResumeMessage event={event} />;
    // case 'PAUSE':
    //   return <PauseMessage event={event} />;
    // case 'DISCONNECT':
    //   return <DisconnectMessage event={event} />;
    // case 'ROLE_ASSIGNMENT':
    //   return <RoleAssignmentMessage event={event} />;
    // case 'TARGET_ROLE':
    //   return <PlayerTargetRoleMessage event={event} />;
    // case 'ARREST':
    //   return <ArrestMessage event={event} />;
    // case 'SWAP':
    //   return <SwapMessage event={event} />;
    // case 'CALL_VOTE':
    //   return <CalledVoteMessage event={event} />;
    default:
      console.warn('missing component for message type: ' + event.type);
      return null;
  }
};

const ChatAvatar: FC<{ senderEntityId: SnowflakeId }> = () => {
  return <Avatar />;
};

const PlainMessage: FC<{ event: PlainMessageEvent; index: number }> = ({
  event,
  index,
}) => {
  // const userId = UserSenderSchema.safeParse(sender).success
  //   ? UserSenderSchema.parse(sender).userId
  //   : null;
  const isContinued = false; // todo move to hook;

  return (
    <Flex align="start" gap="1" css={{ mb: '$1' }}>
      <Box css={isContinued ? { height: '1px', opacity: 0 } : {}}>
        <ChatAvatar senderEntityId={event.senderEntityId} />
      </Box>
      <Flex direction="column" gap="1">
        {/* <MessageCaption /> */}
        <SenderName event={event} index={index} />
        {/* {!isContinued &&
          (userId ? (
            <Caption variant={colorBySlotNumber[players[userId].slotNumber]}>
              {players[userId].name}
              <Caption variant="low_contrast" css={{ display: 'inline' }}>
                {hostIds.includes(userId) && ' • host'}
              </Caption>
            </Caption>
          ) : (
            <Caption>Game{isPrivate && ' • private'}</Caption>
          ))} */}
        <Text css={{ whiteSpace: 'pre-wrap', lineHeight: '135%' }}>
          <MessageComponent message={event.message} />
        </Text>
      </Flex>
    </Flex>
  );
};

const SenderName: FC<{ event: ChatEvent; index: number }> = ({ event }) => {
  const isContinued = false; // todo move to hook;
  const isHost = false;
  const isPrivate = false;

  const name = useEntityIdSelector(event.senderEntityId, (entity: Entity) => {
    if (entity.schema === 'room') {
      return entity.slug;
    } else {
      return 'todo: implement as user.name';
    }
  });

  return !isContinued ? (
    <Caption>
      {name}
      {isHost && (
        <Caption variant="low_contrast" css={{ display: 'inline' }}>
          • host'
        </Caption>
      )}
    </Caption>
  ) : (
    <Caption>Game{isPrivate && ' • private'}</Caption>
  );
};

const MessageComponent: FC<{ message: string }> = ({ message }) => {
  return (
    <Text css={{ whiteSpace: 'pre-wrap', lineHeight: '135%' }}>
      <MessageComponent message={message} />
    </Text>
  );
};

// const Message: FC<{
//   event: MessageEvent;
//   index: number;
// }> = ({ event: { message, sender }, index }) => {
//   const userId = UserSenderSchema.safeParse(sender).success
//     ? UserSenderSchema.parse(sender).userId
//     : null;
//   const isPrivate = ServerSenderSchema.safeParse(sender).success
//     ? ServerSenderSchema.parse(sender).isPrivate
//     : null;
//   const players = useLittleVigilanteSelector((state) => state.players);

//   const service = useContext(ChatServiceContext);
//   const events = useSelector(service, (state) => state.context.events);
//   const prevEvent = events[index - 1];
//   const isContinued = prevEvent && deepEqual(prevEvent.sender, sender);
//   const hostIds = useLittleVigilanteSelector((state) => state.hostUserIds);

//   return (
//     <Flex align="start" gap="1" css={{ mb: '$1' }}>
//       <Box css={isContinued ? { height: '1px', opacity: 0 } : {}}>
//         {userId ? (
//           <PlayerAvatar
//             userId={userId}
//             color={colorBySlotNumber[players[userId].slotNumber]}
//           />
//         ) : (
//           <GameAvatar />
//         )}
//       </Box>
//       <Flex direction="column" gap="1">
//         {!isContinued &&
//           (userId ? (
//             <Caption variant={colorBySlotNumber[players[userId].slotNumber]}>
//               {players[userId].name}
//               <Caption variant="low_contrast" css={{ display: 'inline' }}>
//                 {hostIds.includes(userId) && ' • host'}
//               </Caption>
//             </Caption>
//           ) : (
//             <Caption>Game{isPrivate && ' • private'}</Caption>
//           ))}
//         <Text css={{ whiteSpace: 'pre-wrap', lineHeight: '135%' }}>
//           <MessageComponent message={message} />
//         </Text>
//       </Flex>
//     </Flex>
//   );
// };
