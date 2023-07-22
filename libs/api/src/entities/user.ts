import { createChatMachine } from '@api/services/chat.service';
import { Database } from '@explorers-club/database';
import {
  Entity,
  UserCommand,
  UserContext,
  WithSenderId,
} from '@explorers-club/schema';
import { assertEntitySchema } from '@explorers-club/utils';
import { createClient } from '@supabase/supabase-js';
import { World } from 'miniplex';
import { assign, createMachine, spawn } from 'xstate';

const supabaseUrl = process.env['SUPABASE_URL'];
const supabaseJwtSecret = process.env['SUPABASE_JWT_SECRET'];
const supabaseAnonKey = process.env['SUPABASE_ANON_KEY'];
const supabaseServiceKey = process.env['SUPABASE_SERVICE_KEY'];

// todo: switch to using zod for parsing
if (
  !supabaseUrl ||
  !supabaseJwtSecret ||
  !supabaseAnonKey ||
  !supabaseServiceKey
) {
  throw new Error('missing supabase configuration');
}

export const createUserMachine = ({
  world,
  entity,
}: {
  world: World;
  entity: Entity;
}) => {
  assertEntitySchema(entity, 'user');
  // const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  //   auth: {
  //     persistSession: false,
  //   },
  // });

  const userMachine = createMachine<UserContext, UserCommand>({
    id: 'UserMachine',
    type: 'parallel',
    schema: {
      context: {} as UserContext,
      events: {} as WithSenderId<UserCommand>, // warning sendinerId not present for initialize
    },
    context: {
      chatServiceRef: undefined,
    },
    states: {
      Chat: {
        initial: 'Running',
        entry: assign({
          chatServiceRef: () => {
            return spawn(createChatMachine({ userEntity: entity }), {
              name: 'chatService',
              autoForward: true,
            }) as UserContext['chatServiceRef'];
          },
        }),
        states: {
          Running: {},
        },
      },
      Initialized: {
        initial: 'No',
        states: {
          Yes: {},
          No: {},
        },
      },
      // Unitialized: {
      //   on: {
      //     INITIALIZE: {
      //       target: 'Initializing',
      //     },
      //   },
      // },
      // Initializing: {
      //   invoke: {
      //     onDone: {
      //       target: 'Initialized',
      //       actions: assign({
      //       })
      //     },
      //     onError: 'Error',
      //     src: async (context, event) => {
      //       const id = generateSnowflakeId();
      //       assertEventType(event, "INITIALIZE");

      //       const { deviceId, authTokens, initialLocation: location } = event;
      //       let supabaseSession: Session;

      //       // Get our user from supabase using the auth tokens
      //       if (authTokens) {
      //         const { data, error } = await supabaseClient.auth.setSession({
      //           access_token: authTokens.accessToken,
      //           refresh_token: authTokens.refreshToken,
      //         });

      //         if (error) {
      //           throw new TRPCError({
      //             code: 'BAD_REQUEST',
      //             message: error.message,
      //             cause: error,
      //           });
      //         }

      //         if (!data.session) {
      //           throw new TRPCError({
      //             code: 'BAD_REQUEST',
      //             message: 'Unable to start session',
      //           });
      //         }

      //         supabaseSession = data.session;

      //       } else {
      //         const { data, error } = await supabaseClient.auth.signUp({
      //           email: `anon-${generateRandomString()}@explorers.club`,
      //           password: `${generateRandomString()}33330`,
      //         });
      //         if (error) {
      //           throw new TRPCError({
      //             code: 'INTERNAL_SERVER_ERROR',
      //             message: error.message,
      //             cause: error,
      //           });
      //         }

      //         if (!data.session) {
      //           throw new TRPCError({
      //             code: 'INTERNAL_SERVER_ERROR',
      //             message: 'Expected session but was missing',
      //           });
      //         }
      //         supabaseSession = data.session;
      //         await supabaseClient.auth.setSession({
      //           access_token: data.session.access_token,
      //           refresh_token: data.session.refresh_token,
      //         });
      //       }

      //       const userId = supabaseSession.user.id;

      //       // Find or create session for this user
      //       let sessionService = sessionsServicesByUserId.get(userId) satisfies SessionInterpreter | undefined;
      //       let sessionId: SnowflakeId | undefined;
      //       if (!sessionService) {
      //         sessionService = interpret(
      //           createSessionMachine({ world })
      //         );
      //         sessionService.start();
      //         sessionService.send({
      //           type: "INITIALIZE",
      //           userId: supabaseSession.user.id,
      //           userId: id
      //         })
      //         sessionsServicesByUserId.set(userId, sessionService);
      //       } else {
      //         sessionService.send({ type: "ADD_CONNECTION", userId: id })
      //         sessionId = sessionService.id;
      //       }

      //       const entity: UserEntity = {
      //         id,
      //         schema: "user",
      //         location,
      //         deviceId: deviceId || generateSnowflakeId(),
      //         // sessionId
      //       }
      //       world.add(entity);

      //       return {
      //         entity,
      //         supabaseSession,
      //       };
      //     },
      //   },
      // },
      // Initialized: {},
      // Error: {},
    },
  });
  return userMachine;
};
