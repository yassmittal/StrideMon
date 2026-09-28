import type { ApiErrorCode } from '@stridemon/shared/domain'
import { API_ERROR_MESSAGES } from './api-error-messages'

export type ApiErrorDetails = Record<string, unknown>

/**
 * The only error handlers throw on purpose. `plugins/error-handler.ts` turns it
 * into the `{ error: { code, message, details } }` response body.
 */
export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly statusCode: number
  readonly details: ApiErrorDetails | undefined

  constructor(code: ApiErrorCode, statusCode: number, details?: ApiErrorDetails) {
    super(API_ERROR_MESSAGES[code])
    this.name = 'ApiError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }
}
