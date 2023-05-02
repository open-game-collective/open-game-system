import { router } from '../trpc';
// import { actorRouter } from './actor';
// import { sessionRouter } from './session';
import { connectionRouter } from './connection';

export const apiRouter = router({
  connection: connectionRouter,
  // tile: tileRouter,
  // actor: actorRouter,
  // room: roomRouter,
  // profile: profileRouter,
  // auth: authRouter,
  // session: sessionRouter,
  // entity: entityRouter,
});

// export type definition of API
export type ApiRouter = typeof apiRouter;
