import type { ApiErrorCode } from '@stridemon/shared/domain'

/** Failures that happen before the API can answer, so it has no code for them. */
type ClientSideErrorCode = 'NETWORK_UNREACHABLE' | 'UNEXPECTED_RESPONSE'

export type ApiClientErrorCode = ApiErrorCode | ClientSideErrorCode

/**
 * Every failed API call rejects with this. Screens switch on `code`, never on
 * `message`. `statusCode` is null when no HTTP response arrived.
 */
export class ApiError extends Error {
  readonly code: ApiClientErrorCode
  readonly statusCode: number | null
  readonly details: Record<string, unknown> | undefined

  constructor({
    code,
    message,
    statusCode,
    details,
  }: {
    code: ApiClientErrorCode
    message: string
    statusCode: number | null
    details?: Record<string, unknown> | undefined
  }) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }
}
