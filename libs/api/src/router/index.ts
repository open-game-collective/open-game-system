import { router } from '../trpc';
// import { actorRouter } from './actor';
import { sessionRouter } from './session';
import { entityRouter } from './entity';
import { connectionRouter } from './connection';

export const apiRouter = router({
  entity: entityRouter,
  connection: connectionRouter,
  // tile: tileRouter,
  // actor: actorRouter,
  // room: roomRouter,
  // profile: profileRouter,
  // auth: authRouter,
  session: sessionRouter,
});

// export type definition of API
export type ApiRouter = typeof apiRouter;
