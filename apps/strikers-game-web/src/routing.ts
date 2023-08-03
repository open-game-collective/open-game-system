import type { RouteProps } from '@explorers-club/schema';

// todo use a router here? can we get astros somehow?
export const getRouteProps: (url: URL) => RouteProps = (url) => {
  if (url.pathname === '/') {
    return {
      name: 'Home',
    };
  } else {
    return {
      name: 'Room',
      roomSlug: url.pathname.slice(1),
    };
  }
};
