import { Flex } from '@atoms/Flex';
import { Cross2Icon, ThickArrowLeftIcon } from '@radix-ui/react-icons';
import { map } from 'nanostores';
import { createContext, type FC, type ReactNode } from 'react';
import { Subject } from 'rxjs';

const store = map({
  isOpen: true,
  // leftIcon: <ThickArrowLeftIcon />,
  // rightIcon: <Cross2Icon />,
});

// const subject = new Subject();

// const send = () => {

// }

const BarNavigationContext = createContext(store);

export const BarNavigation: FC<{
  children: ReactNode;
  store: typeof store;
  // send: typeof send;
}> = ({ children, store }) => {
  return (
    <BarNavigationContext.Provider value={store}>
      <BarNavigationRoot>{children}</BarNavigationRoot>
    </BarNavigationContext.Provider>
  );
};

const BarNavigationRoot: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <Flex css={{ flex: 1, justifyContent: 'space-between', gap: '$2' }}>
      {children}
    </Flex>
  );
};

export const BarNavigationLeft: FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <Flex css={{ background: 'white', marginRight: 'auto' }}>{children}</Flex>
  );
};

export const BarNavigationMain: FC<{ children: ReactNode }> = ({
  children,
}) => {
  return <Flex css={{ background: 'white', flex: 1 }}>{children}</Flex>;
};

export const BarNavigationRight: FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <Flex css={{ background: 'white', marginLeft: 'auto' }}>{children}</Flex>
  );
};
