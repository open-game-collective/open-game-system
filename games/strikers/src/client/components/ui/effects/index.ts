import { InterceptAttempt } from './intercept-attempt-effect';
import { MoveEffect } from './move-effect';
import { PassEffect } from './pass-effect';
import { ShootEffect } from './shoot-effect';
import { TackleAttempt } from './tackle-attempt-effect';

export const strikersEffectMap = {
  MOVE: MoveEffect,
  PASS: PassEffect,
  SHOOT: ShootEffect,
  INTERCEPT_ATTEMPT: InterceptAttempt,
  TACKLE_ATTEMPT: TackleAttempt,
} as const;
