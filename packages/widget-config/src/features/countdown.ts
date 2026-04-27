import { z } from 'zod'

export const CountdownSchema = z.object({
  countdownEnabled: z.boolean(),
  textBeforeCountdown: z.string(),
  textBeforeCountdownColor: z.string(),
  countdownDate: z.string(),
  countdownBackgroundColor: z.string(),
  countdownFontColor: z.string(),
})
