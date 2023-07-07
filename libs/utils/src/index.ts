import { Entity } from '@explorers-club/schema';
import { World } from 'miniplex';
import { Observable, Subject } from 'rxjs';
import { EventObject } from 'xstate';
export * from './forms';
export * from './hooks';
export * from './types';

export function assert<T>(
  expression: T,
  errorMessage: string
): asserts expression {
  if (!expression) {
    throw new Error(errorMessage);
  }
}

export function assertEntitySchema<
  TEntity extends Entity,
  TSchemaType extends TEntity['schema']
>(
  entity: TEntity | undefined | null,
  schemaType: TSchemaType
): asserts entity is TEntity & { schema: TSchemaType } {
  assert(entity, `expected entity of schema ${schemaType} but was null`);
  assert(
    entity.schema === schemaType,
    `expected entity to be schema ${schemaType} but was ${entity.schema}`
  );
}

export function assertEventType<
  TE extends EventObject,
  TType extends TE['type']
>(event: TE, eventType: TType): asserts event is TE & { type: TType } {
  if (event.type !== eventType) {
    throw new Error(
      `Invalid event: expected "${eventType}", got "${event.type}"`
    );
  }
}

// todo add other channel schemas here (i.e. dm, group, etc)
export function assertChannelEntity<TEntity extends Entity>(
  entity: TEntity | undefined | null
): asserts entity is TEntity & { schema: 'room' } {
  assert(entity, `expected entity of but was null`);
  assert(
    entity.schema === 'room',
    `expected entity to be one of: 'room', 'dm', 'group'`
  );
}

export const unwrapEvent = <
  T extends { type: K | string },
  K extends string = string
>(
  event: EventObject,
  expectedType: K
): T => {
  if (event.type !== expectedType)
    throw Error(
      `State machine expected an event of type: ${expectedType}, instead got: ${event.type}`
    );

  return event as T;
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = () => {};

/**
 * Retries a promise when a certain condition is true
 */
export const retryPromiseWhen = async (
  promise: Promise<unknown>,
  retryCondition: (result: unknown) => boolean,
  maxAttempts = 5,
  delayMS = 1000
) => {
  let attempts = 0;
  while (attempts < maxAttempts) {
    const result = await promise;
    console.log(result);

    if (!retryCondition(result)) {
      return;
    }

    attempts++;
    await sleep(delayMS);
  }

  throw new Error('failed after ' + maxAttempts);
};

// From https://stackoverflow.com/a/8809472
export function generateUUID() {
  // Public Domain/MIT
  let d = new Date().getTime(); //Timestamp
  let d2 =
    (typeof performance !== 'undefined' &&
      performance.now &&
      performance.now() * 1000) ||
    0; //Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16; //random number between 0 and 16
    if (d > 0) {
      //Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function generateRandomString(): string {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a instanceof Date && b instanceof Date)
    return a.getTime() === b.getTime();
  if (!a || !b || (typeof a !== 'object' && typeof b !== 'object'))
    return a === b;
  if (a === null || a === undefined || b === null || b === undefined)
    return false;
  if (a.prototype !== b.prototype) return false;
  let keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  return keys.every((k) => deepEqual(a[k], b[k]));
}

export function getValueFromPath(obj: any, path: string): any {
  // Remove the leading slash and split the path into parts
  const pathParts = path.slice(1).split('/');
  let currentValue = obj;

  for (const part of pathParts) {
    // Handle arrays
    if (Array.isArray(currentValue)) {
      currentValue = currentValue[Number(part)];
    }
    // Handle objects
    else if (typeof currentValue === 'object' && currentValue !== null) {
      currentValue = currentValue[part];
    }
    // If the current value is neither an array nor an object, it means the path is invalid
    else {
      return undefined;
    }
  }

  return currentValue;
}

export const fromWorld = (world: World<Entity>) => {
  const subject = new Subject<Entity>();
  world.onEntityAdded.add((entity) => {
    subject.next(entity);
  });

  return subject as Observable<Entity>;
};

export function isMobileDevice(userAgent: string): boolean {
  // List of common mobile device keywords
  const mobileKeywords: string[] = [
    'Mobile',
    'Android',
    'iPhone',
    'iPad',
    'Windows Phone',
    'BlackBerry',
    'Opera Mini',
    'IEMobile',
  ];

  // Check if the user agent contains any mobile device keywords
  return mobileKeywords.some(keyword => userAgent.includes(keyword));
}