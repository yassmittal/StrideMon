/**
 * Every error code the API can return. Clients switch on these, never on the
 * human-readable message. Each phase appends the codes it introduces.
 */
export const API_ERROR_CODES = [
  'VALIDATION_FAILED',
  'UNAUTHENTICATED',
  'NOT_FOUND',
  'RATE_LIMITED',
  'INTERNAL_ERROR',
  'INVALID_SIGNATURE',
  'NONCE_EXPIRED',
  'REFRESH_TOKEN_REVOKED',
  'SNEAKER_NOT_OWNED',
  'SNEAKER_OUT_OF_ENERGY',
  'SNEAKER_NEEDS_REPAIR',
  'ACTIVITY_SESSION_ALREADY_ACTIVE',
  'ACTIVITY_SESSION_NOT_ACTIVE',
  'MOCK_LOCATION_DETECTED',
  'INSUFFICIENT_ACTIVITY_DATA',
] as const

export type ApiErrorCode = (typeof API_ERROR_CODES)[number]
