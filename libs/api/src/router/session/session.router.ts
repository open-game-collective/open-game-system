// import { createArchetypeIndex } from '@explorers-club/ecs';
import * as jwt from 'jsonwebtoken';
import { protectedProcedure, router } from '../../trpc';

// const [sessionEntityIndex] = createArchetypeIndex(
//   world.with(
//     'id',
//     'sessionId',
//     'lastHeartbeatAt',
//     'connected',
//     'currentLocation'
//   ),
//   'sessionId'
// );

// const [userEntityIndex] = createArchetypeIndex(
//   world.with('userId', 'sessions'),
//   'userId'
// );

// // const userIndex$ = createArchetypeIndex(world.with('id', 'userId'));

export const sessionRouter = router({
  /**
   * Create a user if tokens are not provided
   * Sets the session and creates the user entity in the world
   */
  generateOneTimeToken: protectedProcedure.mutation(async ({ ctx, input }) => {
    const oneTimeToken = jwt.sign(
      {
        foo: 'bar',
        // todo other context/data here
      },
      'my_private_key',
      {
        subject: ctx.connectionEntity.sessionId,
        expiresIn: '30s',
        jwtid: 'ONE_TIME',
      }
    );

    return { token: oneTimeToken };
  }),
});

// const createSessionMachine = (props: {
//   world: World;
//   entity: SessionEntity;
// }) => {
//   return createMachine({
//     id: 'RoomMachine',
//     context: {
//       foo: 'bar',
//     },
//     type: 'parallel',
//     schema: {
//       context: {} as { foo: 'bar' },
//     },
//     states: {
//       Listed: {
//         initial: 'Yes',
//         states: {
//           No: {},
//           Yes: {},
//         },
//       },
//       Visbility: {
//         initial: 'Anyone',
//         states: {
//           Anyone: {},
//           LoggedIn: {},
//           Friends: {},
//         },
//       },
//     },
//   });
// };

// const createUserMachine = (props: { world: World; entity: UserEntity }) => {
//   return createMachine({
//     id: 'RoomMachine',
//     context: {
//       foo: 'bar',
//     },
//     type: 'parallel',
//     schema: {
//       context: {} as { foo: 'bar' },
//     },
//     states: {
//       Listed: {
//         initial: 'Yes',
//         states: {
//           No: {},
//           Yes: {},
//         },
//       },
//       Visbility: {
//         initial: 'Anyone',
//         states: {
//           Anyone: {},
//           LoggedIn: {},
//           Friends: {},
//         },
//       },
//     },
//   });
// };
