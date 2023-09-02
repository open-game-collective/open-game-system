import {
  Entity,
  SessionCommand,
  SessionContext,
  SessionTypeState,
  WithSenderId,
} from '@explorers-club/schema';
import { assert, fromEntity } from '@explorers-club/utils';
import { World } from 'miniplex';
import { createMachine } from 'xstate';
import { entitiesById } from '..';
import { filter } from 'rxjs';

export const createSessionMachine = ({
  world,
  entity,
}: {
  world: World;
  entity: Entity;
}) => {
  assert(
    entity && entity.schema === 'session',
    'expected session entity but found ' + entity.schema
  );

  // the state is just the number of connectionids
  // so in strikers
  // so here we could create a machine that would be liek
  // fromEntity(entity).pipe(
  //  )
  return createMachine({
    id: 'SessionMachine',
    context: {
      foo: 'bar',
    },
    schema: {
      context: {} as SessionContext,
      events: {} as WithSenderId<SessionCommand>,
    },
    type: 'parallel',
    on: {
      // CONNECT: {
      //   actions: (_, event) => {
      //     console.log('SESSION CONNECT', event);
      //   },
      // },
      // DISCONNECT: {
      //   actions: (_, event) => {
      //     console.log('SESSION DISCONNECT', event);
      //   },
      // },
      NEW_CONNECTION: {
        actions: (_, event) => {
          entity.connectionIds = [...entity.connectionIds, event.connectionId];
        },
      },
    },
    states: {
      Connected: {
        initial: 'No',
        states: {
          Yes: {},
          No: {},
        },
      },
      Initialized: {},
      Error: {},
    },
    predictableActionArguments: true,
    // ADD_CONNECTION: {
    //   actions: (context, event) => {
    //     world.update(entity, 'connectionIds', [
    //       ...entity.connectionIds,
    //       event.connectionId,
    //     ]);
    //   },
    // },
  });
  // const sessionMachine = createMachine({
  //   id: 'SessionMachine',
  //   context: {
  //   },
  //   states: {
  //     Unitialized: {
  //       on: {
  //         REGISTER_DEVICE: {
  //           target: 'Initialized',
  //         },
  //       },
  //     },
  //     Initializing: {
  //       invoke: {
  //         onDone: 'Initialized',
  //         onError: 'Error',
  //         src: async (context, event) => {
  //           const { deviceId, authTokens } = event;
  //           let supabaseSession: Session;

  //           // Check to see if there is already a session for this user
  //           if (authTokens) {
  //             const { data, error } = await supabaseClient.auth.setSession({
  //               access_token: authTokens.accessToken,
  //               refresh_token: authTokens.refreshToken,
  //             });

  //             if (error) {
  //               throw new TRPCError({
  //                 code: 'BAD_REQUEST',
  //                 message: error.message,
  //                 cause: error,
  //               });
  //             }

  //             if (!data.session) {
  //               throw new TRPCError({
  //                 code: 'BAD_REQUEST',
  //                 message: 'Unable to start session',
  //               });
  //             }

  //             supabaseSession = data.session;
  //           } else {
  //             const { data, error } = await supabaseClient.auth.signUp({
  //               email: `anon-${generateRandomString()}@explorers.club`,
  //               password: `${generateRandomString()}33330`,
  //             });
  //             if (error) {
  //               throw new TRPCError({
  //                 code: 'INTERNAL_SERVER_ERROR',
  //                 message: error.message,
  //                 cause: error,
  //               });
  //             }

  //             if (!data.session) {
  //               throw new TRPCError({
  //                 code: 'INTERNAL_SERVER_ERROR',
  //                 message: 'Expected session but was missing',
  //               });
  //             }
  //             supabaseSession = data.session;
  //             await supabaseClient.auth.setSession({
  //               access_token: data.session.access_token,
  //               refresh_token: data.session.refresh_token,
  //             });
  //           }

  //           const sessionEntity = sessionsByUserId.get(supabaseSession.user.id);
  //           if (!sessionEntity) {
  //             const sessionEntity: SessionEntity = {
  //               id: generateSnowflakeId(),
  //               schema: 'session',
  //               connectionIds: [entity.id],
  //               userId: supabaseSession.user.id,
  //             };
  //             world.add(sessionEntity);
  //             const sessionService = interpret(
  //               createSessionMachine({ world, entity: sessionEntity })
  //             );
  //             //   entityServices.set(sessionEntity.id, sessionService);
  //           }

  //           // connectionIdBySessionId.get()

  //           // const session = sessionByUserId.get(sessionId)
  //           return '';
  //         },
  //       },
  //     },
  //     Initialized: {},
  //     Error: {},
  //   },
  // });
};
