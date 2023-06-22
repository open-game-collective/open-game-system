import { Database } from '@explorers-club/database';
import {
  ConnectionCommand,
  ConnectionContext,
  ConnectionEntity,
  ConnectionTypeState,
  Entity,
  HomeRoutePropsSchema,
  InitializedConnectionContext,
  LoginRoutePropsSchema,
  NewRoomContext,
  NewRoomRoutePropsSchema,
  RoomEntity,
  RoomRoutePropsSchema,
  SessionEntity,
} from '@explorers-club/schema';
import {
  assert,
  assertEventType,
  generateRandomString,
} from '@explorers-club/utils';
import { Session, createClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import { World } from 'miniplex';
import { assign, DoneInvokeEvent, createMachine, spawn } from 'xstate';
import { assign as assignImmer } from '@xstate/immer';
import { createEntity, generateSnowflakeId } from '../ecs';
import { createSchemaIndex } from '../indices';
import { world } from '../server/state';
import { newRoomMachine } from '../services';
import { createChatMachine } from '../services/chat.service';
import { ReplaySubject, Subject } from 'rxjs';

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

const [sessionsById] = createSchemaIndex(world, 'session', 'id');
const [sessionsByUserId] = createSchemaIndex(world, 'session', 'userId');
const [roomsBySlug] = createSchemaIndex(world, 'room', 'slug');

// const homeRoute = match('/');
// const newRoomRoute = match('/new');
// const loginRoute = match('/login');
// const roomRoute = match('/:id');

// const matchesRoute = (location: string, route: MatchFunction<object>) =>
//   !!route(new URL(location).pathname);

export const createConnectionMachine = ({
  world,
  entity,
}: {
  world: World;
  entity: Entity;
}) => {
  const connectionEntity = entity as ConnectionEntity;
  let sessionEntity: SessionEntity | undefined = undefined;

  const connectionMachine = createMachine<
    ConnectionContext,
    ConnectionCommand,
    ConnectionTypeState
  >(
    {
      // /** @xstate-layout N4IgpgJg5mDOIC5QGED2A7dYDGAXAlhgLICG2AFvlgHQCS6+BJANvgF6TUBiLsYAxLQBytACq0AggBlaALQCiAbQAMAXUSgADqliNC6DSAAeiAIwBWAMzUAHADYA7KZsPzAGhABPM-eqm7pgAs5jaWYeGWpgC+UR5omDgExGSUNPR6LOyc6UysbFRQ-BAYYNRUAG6oANal8Vh4+qQUVKU5+JkcEHQMuewFCBWo2CRJ6Cqq44bauqOGJgjBAJy2js6uHt4IppG25hZ2AEzmMXEY9aNNqa097XnZNx0F-GAATi+oL9SazCMAZh8AW2odUSjRSLW6GTuXTaj3QUAG6Eqw1G40mSBA0z0GDmZisKycLncXjMlhs1DsAWCoQiYWiJxA6FQEDghhBDWSzSwUx02IMGPmAFpLMtzMoHDZTEcNohBYFAtRFgc1sdYiB2RdwWkHtCeTN9LiEOTAkqVTKFgdqOYJVLVacEhz0JcIbDodxeGA9XzDeY7NQTcqieagtYDvKHIt-JTo3ZFgyNWCudcoVkYTq+vCvbMBYgDotzNQJYtlIdiZttspqOLJUd42dQZyrpDep1qKIXgBXT0YrHZ0DzOzKazbA41st46zWscxGJAA */
      id: 'ConnectionMachine',
      type: 'parallel',
      context: {
        supabaseClient: undefined,
        chatServiceRef: undefined,
      },
      states: {
        Route: {
          initial: 'Uninitialized',
          on: {
            NAVIGATE: [
              {
                target: 'Route.Home',
                cond: (_, event) =>
                  HomeRoutePropsSchema.safeParse(event.route).success,
              },
              {
                target: 'Route.NewRoom',
                cond: (_, event) =>
                  NewRoomRoutePropsSchema.safeParse(event.route).success,
              },
              {
                target: 'Route.Login',
                cond: (_, event) =>
                  LoginRoutePropsSchema.safeParse(event.route).success,
              },
              {
                target: 'Route.Room',
                cond: (_, event) =>
                  RoomRoutePropsSchema.safeParse(event.route).success,
              },
            ],
          },
          states: {
            Uninitialized: {
              on: {
                INITIALIZE: [
                  {
                    target: 'Home',
                    cond: (_, event) => event.initialRouteProps.name === 'Home',
                  },
                  {
                    target: 'Login',
                    cond: (_, event) =>
                      event.initialRouteProps.name === 'Login',
                  },
                  {
                    target: 'NewRoom',
                    cond: (_, event) =>
                      event.initialRouteProps.name === 'NewRoom',
                  },
                  {
                    target: 'Room',
                    cond: (_, event) => event.initialRouteProps.name === 'Room',
                    actions: ['initializeCurrentRoom'],
                  },
                ],
              },
            },
            Home: {},
            Login: {},
            NewRoom: {
              invoke: {
                id: 'newRoomService',
                src: newRoomMachine,
                autoForward: true,
                onDone: {
                  target: 'Room',
                  actions: (
                    _,
                    event: DoneInvokeEvent<Required<NewRoomContext>>
                  ) => {
                    assert(
                      sessionEntity,
                      'expected sessionEntity but not found'
                    );

                    const { gameId, roomSlug } = event.data;

                    const entity = createEntity<RoomEntity>({
                      schema: 'room',
                      slug: roomSlug,
                      hostConnectionEntityId: connectionEntity.id,
                      connectedEntityIds: [],
                      gameId,
                      channel: new ReplaySubject(),
                    });
                    world.add(entity);

                    // [??]: does this need to be addComponent
                    connectionEntity.currentRoomSlug = roomSlug;
                  },
                },
              },
            },
            Room: {
              entry: [
                'spawnChatService',
                (context) => {
                  assert(
                    context.chatServiceRef,
                    'expected chat service to be initialized'
                  );
                  assert(
                    connectionEntity.currentRoomSlug,
                    'expected current room slug'
                  );

                  let roomEntity = roomsBySlug.get(
                    connectionEntity.currentRoomSlug
                  );

                  // Create the room if one doesnt already exist
                  if (!roomEntity) {
                    roomEntity = createEntity<RoomEntity>({
                      schema: 'room',
                      slug: connectionEntity.currentRoomSlug,
                      hostConnectionEntityId: connectionEntity.id,
                      connectedEntityIds: [connectionEntity.id],
                      channel: new ReplaySubject(),
                    });
                    world.add(roomEntity);
                  } else {
                    // Otherwise connect to existing one
                    roomEntity.send({
                      type: 'CONNECT',
                      connectionEntityId: connectionEntity.id,
                    });
                  }

                  // Join the chat room
                  context.chatServiceRef.send({
                    type: 'JOIN_CHANNEL',
                    channelId: roomEntity.id,
                  });

                  // Join the game room if there is one
                  if (roomEntity.gameId) {
                    context.chatServiceRef.send({
                      type: 'JOIN_CHANNEL',
                      channelId: roomEntity.gameId,
                    });
                  }

                  // todo clean up ref
                  // wasnt able to get assign on entry to be called so gave up
                  // spawn(
                  //   chatMachine.withContext({
                  //     roomSlug: connectionEntity.currentRoomSlug,
                  //   }),
                  //   'chatService'
                  // );
                  // chatService.join()
                },
              ],
            },
          },
        },
        Initialized: {
          initial: 'False',
          states: {
            False: {
              on: {
                INITIALIZE: {
                  target: 'Initializing',
                },
              },
            },
            Error: {},
            Initializing: {
              invoke: {
                onError: 'Error',
                onDone: {
                  target: 'True',
                  actions: assignImmer<
                    ConnectionContext,
                    DoneInvokeEvent<InitializedConnectionContext>
                  >((context, { data }) => {
                    // context.location = data.location;
                    // context.deviceId = data.deviceId;
                    context.supabaseClient = data.supabaseClient;
                  }),
                },
                src: async (context, event) => {
                  assertEventType(event, 'INITIALIZE');

                  const { authTokens } = event;

                  const supabaseClient = createClient<Database>(
                    supabaseUrl,
                    supabaseAnonKey,
                    {
                      auth: {
                        persistSession: false,
                      },
                    }
                  );

                  let supabaseSession: Session;
                  if (authTokens) {
                    const { data, error } =
                      await supabaseClient.auth.setSession({
                        access_token: authTokens.accessToken,
                        refresh_token: authTokens.refreshToken,
                      });

                    if (error) {
                      throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: error.message,
                        cause: error,
                      });
                    }
                    if (!data.session) {
                      throw new TRPCError({
                        code: 'UNAUTHORIZED',
                        message:
                          'Not able to get supabase session with authTokens',
                      });
                    }
                    supabaseSession = data.session;
                  } else {
                    const { data, error } = await supabaseClient.auth.signUp({
                      email: `anon-${generateRandomString()}@explorers.club`,
                      password: `${generateRandomString()}33330`,
                    });
                    if (error) {
                      throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: error.message,
                        cause: error,
                      });
                    }

                    if (!data.session) {
                      throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Expected session but was missing',
                      });
                    }
                    supabaseSession = data.session;
                    await supabaseClient.auth.setSession({
                      access_token: data.session.access_token,
                      refresh_token: data.session.refresh_token,
                    });
                  }

                  const userId = supabaseSession.user.id;
                  sessionEntity = sessionsByUserId.get(userId) as
                    | SessionEntity
                    | undefined;
                  if (sessionEntity) {
                    // add the session Id to the connectionEntity
                    world.addComponent(
                      connectionEntity,
                      'sessionId',
                      sessionEntity.id
                    );
                  } else {
                    const { createEntity } = await import('../ecs');
                    sessionEntity = createEntity<SessionEntity>({
                      schema: 'session',
                      userId,
                    });
                    // add the session Id to the connection
                    world.addComponent(
                      connectionEntity,
                      'sessionId',
                      sessionEntity.id
                    );
                    world.add(sessionEntity);
                  }

                  const deviceId = event.deviceId || generateSnowflakeId();

                  // Do I need to use addComponent
                  connectionEntity.deviceId = deviceId;
                  connectionEntity.authTokens = {
                    accessToken: supabaseSession.access_token,
                    refreshToken: supabaseSession.refresh_token,
                  };

                  return {
                    supabaseClient,
                  } satisfies InitializedConnectionContext;
                },
              },
            },
            True: {},
          },
        },
        Geolocation: {
          initial: 'Uninitialized',
          states: {
            Uninitialized: {
              on: {
                UPDATE_GEOLOCATION_POSITION: {
                  target: 'Initialized',
                  cond: (_, event) => !!event.position,
                },
              },
            },
            Initialized: {
              entry: (context, event) => {
                console.log('ININTIALIZED!', event);
                if (event.type === 'UPDATE_GEOLOCATION_POSITION') {
                  connectionEntity.currentGeolocation = event.position;
                } else {
                  console.warn(
                    'Expected to enter Initialized state via UPDATE_GEOLOCATION_POSITIOn event but didnt'
                  );
                }
              },
              on: {
                UPDATE_GEOLOCATION_POSITION: {
                  actions: (_, event) => {
                    connectionEntity.currentGeolocation = event.position;
                  },
                },
              },
              // on: {
              //   UPDATE_GEOLOCATION_POSITION
              // }
            },
            // TimedOut: {},
            Error: {},
            Denied: {},
          },
        },
      },
      predictableActionArguments: true,
    },
    {
      actions: {
        spawnChatService: assign({
          chatServiceRef: () =>
            spawn(
              createChatMachine({ connectionEntity }),
              'chatService'
            ) as ConnectionContext['chatServiceRef'],
        }),
        // spawnChatService: assign({
        //   chatServiceRef: () => {
        //     console.log('this does not');
        //     return spawn(
        //       createChatMachine({ connectionEntity }),
        //       'chatService'
        //     ) as ConnectionContext['chatServiceRef'];
        //   },
        // }),
        // spawnChatService: () => {
        //   console.log('SPAWNING');
        //   console.log('SPAWNINGee');
        // },
        // spawnChatService: assignImmer<ConnectionContext>((context) => {
        //   console.log('SPAWNING');
        //   if (!context.chatServiceRef) {
        //     context.chatServiceRef = spawn(
        //       createChatMachine({ connectionEntity }),
        //       'chatService'
        //     ) as ConnectionContext['chatServiceRef'];
        //   }
        //   console.log('SPAWNINGee');
        // }),
        initializeCurrentRoom: (_, event) => {
          console.log('inintializing');
          assertEventType(event, 'INITIALIZE');

          if (event.initialRouteProps.name == 'Room') {
            connectionEntity.currentRoomSlug = event.initialRouteProps.roomSlug;
          }
        },
      },
    }
  );
  return connectionMachine;
};
