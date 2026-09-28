import { z } from 'zod'
import { API_ERROR_CODES } from '../domain/api-error-code'

export const apiErrorCodeSchema = z.enum(API_ERROR_CODES)

/** The body of every non-2xx API response. */
export const apiErrorResponseSchema = z.object({
  error: z.object({
    code: apiErrorCodeSchema,
    message: z.string(),
    details: z.record(z.string(), z.unknown()).optional(),
  }),
})
export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>
