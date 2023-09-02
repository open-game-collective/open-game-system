import { getProject } from '@theatre/core';
import { atom } from 'nanostores';

export const sheetStore = atom(getProject('Demo Project').sheet('Demo Sheet'));

// export const TheatreContext = createContext({} as typeof sheetStore);
