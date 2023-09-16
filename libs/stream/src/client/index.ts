import { createTRPCReact } from '@trpc/react-query';
import { inferRouterOutputs } from '@trpc/server';
import type { StreamRouter } from '../router';

export type { StreamRouter };

export const trpcStream = createTRPCReact<StreamRouter>();

export type ApiOutputs = inferRouterOutputs<StreamRouter>;
