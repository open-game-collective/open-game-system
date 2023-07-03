import { ConnectionInitializeInputSchema } from '@schema/lib/connection';
import { protectedProcedure, publicProcedure, router } from '../../trpc';
import {
  ConnectionEntity,
  InitializedConnectionEntity,
  UserEntity,
} from '@schema/types';
import { world, entitiesById, refreshTokensByUserId } from '../../server/state';
import { waitForCondition } from '../../world';
import * as jwt from 'jsonwebtoken';
import { createEntity } from '../../ecs';
import { randomUUID } from 'crypto';

let serialNumber = 1;

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

      // if (!refreshToken) {
      //   const user = createEntity<UserEntity>({
      //     schema: 'user',
      //     serialNumber,
      //   });
      //   world.add(user);

      //   refreshToken = jwt.sign({}, 'my_private_key', {
      //     subject: user.id,
      //   });
      //   refreshTokensByUserId.set(user.id, refreshToken);
      // }

      // if (!deviceId) {
      //   deviceId = randomUUID();
      // }

      // entity.send({
      //   type: 'INITIALIZE',
      //   initialRouteProps,
      //   deviceId,
      //   refreshToken,
      // });

      // const accessToken = await new Promise<string>((resolve) => {
      //   const unsub = entity.subscribe(() => {
      //     if (entity.accessToken) {
      //       resolve(entity.accessToken);
      //       unsub();
      //     }
      //   });
      // });
    }),
});
