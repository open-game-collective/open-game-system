// See explanation at https://trpc.io/docs/context#inner-and-outer-context
// Inner context is context which doesn't depend on the request (e.g. DB)
import { type inferAsyncReturnType } from '@trpc/server';
import { types } from 'mediasoup';

export type CreateContextOptions = {
  worker: types.Worker<types.AppData>;
  connectionId: string;
};

export const createContextInner = async (ctx: CreateContextOptions) => {
  return {
    ...ctx,
  };
};

export type TRPCContext = inferAsyncReturnType<typeof createContextInner>;
