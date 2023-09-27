import { Badge } from '@atoms/Badge';
import { Caption } from '@atoms/Caption';
import { Flex } from '@atoms/Flex';
import { TextField } from '@atoms/TextField';
import { WorldContext } from '@context/WorldProvider';
import {
  MessageChannelEntity,
  MessageContentBlock,
  SnowflakeId,
  UserEntity,
} from '@explorers-club/schema';
import { styled } from '@explorers-club/styles';
import { assert, assertEntitySchema } from '@explorers-club/utils';
import { useEntitiesStoreSelector } from '@hooks/useEntitiesStoreSelector';
import { useEntityIdSelector } from '@hooks/useEntityIdSelector';
import {
  useEntitySelector,
  useEntitySelectorDeepEqual,
} from '@hooks/useEntitySelector';
import { MessageContent } from '@molecules/Blocks';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { Atom, map } from 'nanostores';
import {
  FC,
  FormEventHandler,
  MutableRefObject,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { ChatContext } from './chat.context';
import { Box } from '@atoms/Box';
import { secondaryColorByRole } from '@explorers-club/little-vigilante/meta/little-vigilante.constants';

type PlainMessageEvent = {
  type: 'PLAIN_MESSAGE';
  id: SnowflakeId;
  senderEntityId: SnowflakeId;
  message: string;
};

export const Chat = () => {
  return (
    <Flex direction="column" css={{ width: '100%' }}>
      <ChatMessageList />
      <ChatInput disabled={false} />
    </Flex>
  );
};

const ChatInput: FC<{ disabled: boolean }> = ({ disabled }) => {
  const { roomEntity } = useContext(ChatContext);

  const textRef = useRef<HTMLInputElement | null>(null);
  const handleSubmit: FormEventHandler = useCallback(
    (e) => {
      const text = textRef.current?.value || '';
      e.preventDefault();

      if (text !== '') {
        // todo send
        // roomEntity.send({
        //   type: 'MESSAGE',
        //   message: {
        //     type: 'PLAIN_MESSAGE',
        //     text,
        //   },
        // });

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
    <Flex direction="column" css={{ border: '4px solid $primary6' }}>
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

const messageChannel$ = map({
  isScrolled: false,
  scrollToBottom: () => {},
});

const CombinedMessageChannelContext = createContext(
  {} as {
    userEntity: UserEntity;
    messageChannel$: typeof messageChannel$;
  }
);

const ChatMessageList = () => {
  const { userEntity } = useContext(ChatContext);

  const channelEntityIds = useEntitySelectorDeepEqual(userEntity, (entity) => {
    return entity.chatService?.context.channelEntityIds;
  });

  if (!channelEntityIds) {
    return <div>loading messages</div>;
  }

  return (
    <CombinedMessageChannelContext.Provider
      value={{ userEntity, messageChannel$ }}
    >
      <CombinedMessageChannel />
    </CombinedMessageChannelContext.Provider>
  );
};

const CombinedMessageChannel = () => {
  const { userEntity } = useContext(CombinedMessageChannelContext);
  const { createEntityStore } = useContext(WorldContext);
  const { messageChannel$ } = useContext(CombinedMessageChannelContext);

  /**
   * Creates entity stores for each message channel a user is in
   */
  const [messageChannelStoreMap] = useState<
    Map<string, Atom<MessageChannelEntity>>
  >(() => {
    const result: Map<string, Atom<MessageChannelEntity>> = new Map();
    const channelEntityIds = userEntity.chatService?.context.channelEntityIds;
    if (channelEntityIds) {
      for (const channelId in channelEntityIds) {
        const messageChannelId = channelEntityIds[channelId];
        const store = createEntityStore<MessageChannelEntity>(
          (entity) => entity.id === messageChannelId
        ) as Atom<MessageChannelEntity>; // todo why i have to cast this?
        result.set(messageChannelId, store);
      }
    }

    return result;
  });

  const [messageChannelStores, setMessageChannelStores] = useState(() => {
    return Array.from(messageChannelStoreMap.values());
  });

  // Listens for changes to the list of message channels a user has access to.
  // When a new one is added, updates the map holding the message channel stores.
  useEffect(() => {
    return userEntity.subscribe(() => {
      const channelEntityIds = userEntity.chatService?.context.channelEntityIds;
      if (!channelEntityIds) {
        return;
      }

      let changes = false;
      for (const channelId in channelEntityIds) {
        const messageChannelId = channelEntityIds[channelId];

        if (!messageChannelStoreMap.get(messageChannelId)) {
          const store = createEntityStore<MessageChannelEntity>(
            (entity) => entity.id === messageChannelId
          ) as Atom<MessageChannelEntity>; // todo why i have to cast this?
          messageChannelStoreMap.set(messageChannelId, store);
          changes = true;
        }
      }

      // Update the array of message channel stores
      if (changes) {
        setMessageChannelStores(Array.from(messageChannelStoreMap.values()));
      }
    });
  }, [userEntity, createEntityStore, messageChannelStoreMap]);

  const messageTuples = useEntitiesStoreSelector<
    MessageChannelEntity,
    (readonly [SnowflakeId, SnowflakeId])[]
  >(messageChannelStores, (entities) => {
    return entities.flatMap((entity) =>
      entity.messageIds.map((messageId) => [entity.id, messageId] as const)
    );
  });
  console.log({ messageTuples });

  const scrollViewRef = useRef<HTMLDivElement | null>(null);

  useAnchoredScrolling(scrollViewRef);

  useLayoutEffect(() => {
    // todo add a way to keep the scroll view anchored to bottom
  });

  if (!messageTuples || !messageTuples.length) {
    return <div>no messages</div>;
  }

  return (
    <Flex
      direction="column"
      gap="1"
      justify="end"
      css={{
        // px: '$3',
        // py: '$2',
        height: '250px',
        // minHeight: '100%',
        border: '4px solid $primary3',
        // flexGrow: 1,
        position: 'relative',
      }}
    >
      <Flex
        direction="column"
        gap="1"
        css={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        <ChatRoot>
          <ChatViewport ref={scrollViewRef}>
            <Flex direction="column" gap="2">
              {messageTuples.map(([messageChannelId, messageId], index) => {
                return (
                  <ChatMessage
                    key={messageId}
                    index={index}
                    messageChannelId={messageChannelId}
                    messageId={messageId}
                  />
                );
              })}
            </Flex>
            <TypingIndicator />
          </ChatViewport>
          <ChatScrollbar orientation="vertical">
            <ChatScrollThumb />
          </ChatScrollbar>
        </ChatRoot>
      </Flex>
    </Flex>
  );
};

/**
 * Tracks the scroll state in the store map
 */
const useAnchoredScrolling = (
  scrollViewRef: MutableRefObject<HTMLDivElement | null>
) => {
  useEffect(() => {
    const scrollView = scrollViewRef.current;
    if (!scrollView) {
      return;
    }

    // Resize observer to handle size changes of children
    const resizeObserver = new ResizeObserver(() => {
      // schedule scroll after the next render
      if (!messageChannel$.get().isScrolled) {
        setTimeout(() => {
          scrollView.scrollTo(0, scrollView.scrollHeight);
        }, 0);
      }
    });

    // Observe each child of the scrollView for size changes
    const observeChildren = () => {
      Array.from(scrollView.children).forEach((child) => {
        resizeObserver.observe(child);
      });
    };
    observeChildren();

    // Mutation observer to handle addition/removal of children
    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          // Stop observing old nodes and observe new ones
          resizeObserver.disconnect();
          observeChildren();
        }
      }
    });
    mutationObserver.observe(scrollView, { childList: true });

    // Function to check if the scrollView is scrolled to the bottom
    const isScrolledToBottom = () => {
      const { clientHeight, scrollTop, scrollHeight } = scrollView;
      return clientHeight + scrollTop === scrollHeight;
    };

    // Your existing scroll listener
    const handleScroll = (e: Event) => {
      if (isScrolledToBottom()) {
        messageChannel$.setKey('isScrolled', false);
      } else {
        messageChannel$.setKey('isScrolled', true);
      }
    };
    scrollView.addEventListener('scroll', handleScroll);

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      scrollView?.removeEventListener('scroll', handleScroll);
    };
  }, [scrollViewRef]);
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

const ChatMessage: FC<{
  messageId: string;
  messageChannelId: string;
  index: number;
}> = ({ messageId, messageChannelId, index }) => {
  const message = useEntityIdSelector(messageChannelId, (entity) => {
    assertEntitySchema(entity, 'message_channel');
    return entity.eventsById[messageId];
  });

  if (!message) {
    return <div>placeholder</div>;
  }

  assert(
    message.type === 'MESSAGE',
    'expected chat message to be of type message'
  );

  // better way to do this?
  messageChannel$.get().scrollToBottom();

  return (
    <>
      {message.contents.map((block, index) => (
        <MessageContent
          key={index}
          blockIndex={index}
          block={block as unknown as MessageContentBlock}
          message={message as any} // idk
        />
      ))}
    </>
  );
};
