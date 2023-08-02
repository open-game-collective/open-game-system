import { z } from 'zod';

export const MultipleChoiceSelectCommandSchema = z.object({
  type: z.literal('MULTIPLE_CHOICE_SELECT'),
  value: z.string(),
});

export const MultipleChoiceConfirmCommandSchema = z.object({
  type: z.literal('MULTIPLE_CHOICE_CONFIRM'),
});
