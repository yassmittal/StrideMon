import type { ApiErrorCode } from '@stridemon/shared/domain'

/**
 * One human-readable message per code. A `Record` over the union means adding a
 * code without a message fails the typecheck. Clients show these but never parse them.
 */
export const API_ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  VALIDATION_FAILED: 'The request is invalid.',
  UNAUTHENTICATED: 'You need to sign in first.',
  NOT_FOUND: 'That resource does not exist.',
  RATE_LIMITED: 'Too many requests. Please slow down and try again shortly.',
  INTERNAL_ERROR: 'Something went wrong on our side.',
  INVALID_SIGNATURE: 'The signature does not match a sign-in message this server issued.',
  NONCE_EXPIRED: 'This sign-in request has expired or was already used. Start signing in again.',
  REFRESH_TOKEN_REVOKED: 'This sign-in was revoked. Sign in again with your wallet.',
}
