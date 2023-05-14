import type { Entity } from '@explorers-club/schema';
import { World } from 'miniplex';
import { atom } from 'nanostores';

export const worldStore = atom(new World<Entity>());