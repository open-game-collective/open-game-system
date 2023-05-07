import { ConnectionInitializeInputSchema } from '@explorers-club/schema';
import { protectedProcedure, publicProcedure, router } from '../../trpc';

export const connectionRouter = router({
  heartbeat: protectedProcedure.mutation(async ({ ctx }) => {
    ctx.connectionEntity.send({
      type: 'HEARTBEAT',
    });
  }),

  // navigate: protectedProcedure
  //   .input(z.object({ location: z.string().url() }))
  //   .mutation(async ({ ctx, input }) => {
  //     ctx.connectionEntity.send({
  //       type: 'NAVIGATE',
  //       location: input.location,
  //     });
  //   }),

  initialize: publicProcedure
    .input(ConnectionInitializeInputSchema)
    .mutation(async ({ ctx, input }) => {
      ctx.connectionEntity.send({
        type: 'INITIALIZE',
        ...input,
      });

      return ctx.connectionEntity.id;
    }),
});
