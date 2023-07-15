import { StrikersCardSettings, StrikersGameplaySettings } from '@schema/types';

export const gameplaySettings = {
  actionsPerTurn: 4,
  rollThresholds: {
    PENALTY_KICK: {
      value: 10,
    },
    DIRECT_KICK: {
      value: 10,
    },
    INDIRECT_KICK: {
      value: 10,
    },
    SHORT_PASS: {
      value: 5,
    },
    LONG_PASS: {
      value: 10,
    },
    THROUGH_PASS: {
      value: 3,
    },
    LOB_PASS: {
      value: 10,
    },
    TACKLE: {
      value: 10,
    },
    MARKING: {
      value: 10,
    },
    SHOT: {
      value: 3,
    },
  },
  speedThresholds: {
    S: 5,
    A: 4,
    B: 3,
    C: 2,
  },
} satisfies StrikersGameplaySettings;

export const cardSettings = {
  GK_POSSESSION_MIN: 0,
  GK_POSSESSION_MAX: 9,
  DEF_POSSESSION_MIN: 3,
  DEF_POSSESSION_MAX: 12,
  MID_POSSESSION_MIN: 3,
  MID_POSSESSION_MAX: 13,
  FWD_POSSESSION_MIN: 3,
  FWD_POSSESSION_MAX: 14,
  STAMINA_MIN: 4,
  STAMINA_MAX: 6,
  SALARY_MIN: 3500,
  SALARY_MAX: 13500,
} satisfies StrikersCardSettings;
