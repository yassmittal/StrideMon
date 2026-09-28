import { z } from 'zod'

export const mongoConnectionStatusSchema = z.enum(['connected', 'unreachable'])
export type MongoConnectionStatus = z.infer<typeof mongoConnectionStatusSchema>

export const healthResponseSchema = z.object({
  status: z.literal('ok'),
  mongo: mongoConnectionStatusSchema,
})
export type HealthResponse = z.infer<typeof healthResponseSchema>
