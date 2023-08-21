import { useTakeovers } from './useTakeovers';

/**
 * @returns the first item in the list of potential screen takeovers list
 */
export const useCurrentTakeover = () => {
  const potentialTakeovers = useTakeovers();
  return potentialTakeovers[0];
};
