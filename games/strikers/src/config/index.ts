import { StrikersCardSettings, StrikersGameplaySettings } from '@schema/types';

export const gameplaySettings = {
  rollThresholds: {
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
  ENDURANCE_MIN: 4,
  ENDURANCE_MAX: 6,
  SALARY_MIN: 3500,
  SALARY_MAX: 13500,
} satisfies StrikersCardSettings;
