// See explanation at https://trpc.io/docs/context#inner-and-outer-context
// Inner context is context which doesn't depend on the request (e.g. DB)
import { type inferAsyncReturnType } from '@trpc/server';

export type CreateContextOptions = {
  peerId: string;
  streamToken: string;
};

export const createContextInner = async (ctx: CreateContextOptions) => {
  return {
    ...ctx,
  };
};

export type TRPCContext = inferAsyncReturnType<typeof createContextInner>;
