import { Entity, RouteProps } from '@explorers-club/schema';
import { World } from 'miniplex';
import { ReadableAtom, type Atom, MapStore, MapStoreKeys } from 'nanostores';
import { Observable, Subject } from 'rxjs';
import { AnyEventObject, EventObject } from 'xstate';
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

// todo is this the same now as assertEventType?
export function assertType<
  TE extends { type: string },
  TType extends TE['type']
>(event: TE, eventType: TType): asserts event is TE & { type: TType } {
  if (event.type !== eventType) {
    throw new Error(
      `Invalid event: expected "${eventType}", got "${event.type}"`
    );
  }
}

export function assertRouteName<
  TRouteProps extends RouteProps,
  TRouteName extends RouteProps['name']
>(
  routeProps: TRouteProps,
  routeName: TRouteName
): asserts routeProps is TRouteProps & { name: TRouteName } {
  assert(
    routeProps.name === routeName,
    `expected routeProps for ${routeName} but route was` + routeProps.name
  );
}

export function assertProp<T extends keyof AnyEventObject>(
  event: AnyEventObject,
  key: T
): asserts event is AnyEventObject & Record<T, any> {
  if (!(key in event)) {
    throw new Error(`Key '${key}' is missing in object ` + event);
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

export const fromEntity = <TEntity extends Entity>(entity: TEntity) => {
  return new Observable<{
    entity: TEntity;
    event: Parameters<Parameters<TEntity['subscribe']>[0]>[0];
  }>((observer) => {
    // Subscribe to yourObject and get the unsubscribe function
    const unsubscribe = entity.subscribe((event) => {
      observer.next({ entity, event });
    });

    // Return the unsubscribe function as the teardown logic
    return unsubscribe;
  });
};

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
  return mobileKeywords.some((keyword) => userAgent.includes(keyword));
}

export function lerp(a: number, b: number, t: number): number {
  return (1 - t) * a + t * b;
}

// todo clarify diff between this and MakeRequire in utils/types.ts

type AllRequired<T> = {
  [P in keyof T]-?: T[P];
};

/**
 * Wait for a truthy value from the nanostore. If the value is falsy, it waits for the specified duration.
 * If the value remains falsy after the duration, it throws an exception.
 * @param {Object} store - The nanostore object.
 * @param {Number} timeout - The number of milliseconds to wait for a truthy value.
 * @return {Promise<Require<T>>} The store value.
 */
export function waitForStoreValue<T>(
  store: Atom<T | null>,
  timeout = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    // If the value is already truthy, resolve immediately.
    const currentValue = store.get();
    if (currentValue !== null) {
      resolve(currentValue);
      return;
    }

    // Otherwise, subscribe to the store and wait for changes.
    let timeoutId: ReturnType<typeof setTimeout>;
    const unbind = store.subscribe((value) => {
      if (value !== null) {
        clearTimeout(timeoutId);
        unbind(); // Unsubscribe to the store.
        resolve(value as AllRequired<T>);
      }
    });

    // If the value does not become truthy within the timeout, reject.
    timeoutId = setTimeout(() => {
      unbind(); // Unsubscribe to the store.
      reject(
        new Error(
          `Timed out waiting for a truthy value from the store after ${timeout}ms.`
        )
      );
    }, timeout);
  });
}

// Usage example with type:
// Assuming $loadingState is a nanostore with type LoadingStateValue, you can use the utility function as follows:
/*
waitForStoreValue<LoadingStateValue>($loadingState, 2000)
  .then(value => console.log('Store value:', value))
  .catch(err => console.error(err.message));
*/

// Utility function to wait for the atom to change to a specific value
export function waitForTargetValue<T>(
  atom: ReadableAtom<T>,
  targetValue: T,
  timeoutInSeconds: number = 10 // Default to 10 seconds
): Promise<T> {
  return new Promise((resolve, reject) => {
    if (atom.get() === targetValue) {
      return resolve(targetValue);
    }

    let timeoutId: NodeJS.Timeout;

    const listener = (value: T) => {
      if (value === targetValue) {
        clearTimeout(timeoutId);
        resolve(value);
        unsub();
      }
    };

    // Set the listener to the atom
    const unsub = atom.subscribe(listener);

    // Set a timeout for the desired duration
    timeoutId = setTimeout(() => {
      unsub();
      reject(
        new Error(
          `Expected value "${targetValue}" was not reached in ${timeoutInSeconds} seconds.`
        )
      );
    }, timeoutInSeconds * 1000);
  });
}

// export function waitForMapValue<
//   M extends MapStore,
//   K extends MapStoreKeys<M>,
//   T extends any
// >(
//   mapAtom: M,
//   key: K,
//   targetValue: T,
//   timeoutInSeconds: number = 10 // Default to 10 seconds
// ): Promise<T> {
//   return new Promise((resolve, reject) => {
//     console.log('wait for')
//     if (mapAtom.get()[key] === targetValue) {
//       return resolve(targetValue);
//     }

//     let timeoutId: NodeJS.Timeout;

//     const unsub = mapAtom.subscribe(() => {
//       if (mapAtom.get()[key] === targetValue) {
//         clearTimeout(timeoutId);
//         resolve(targetValue);
//         unsub();
//       }
//     });

//     // Set a timeout for the desired duration
//     timeoutId = setTimeout(() => {
//       unsub();
//       reject(
//         new Error(
//           `Expected value "${targetValue}" was not reached in ${timeoutInSeconds} seconds.`
//         )
//       );
//     }, timeoutInSeconds * 1000);
//   });
// }
