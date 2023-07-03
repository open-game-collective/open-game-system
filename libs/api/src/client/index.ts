import { createTRPCReact } from '@trpc/react-query';
import { inferRouterOutputs } from '@trpc/server';
import type { ApiRouter } from '../router';

export * from '../transformer';
export * from '../world';
export type { ApiRouter };

export const trpc = createTRPCReact<ApiRouter>();

export type ApiOutputs = inferRouterOutputs<ApiRouter>;
