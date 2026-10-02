/** Where an activity session is in its life (data-model.md → activitySessions). */
export const ACTIVITY_SESSION_STATUSES = [
  'active',
  'validating',
  'settling',
  'settled',
  'rejected',
  'abandoned',
] as const

export type ActivitySessionStatus = (typeof ACTIVITY_SESSION_STATUSES)[number]

/** Why a session was rejected. Each is also an `ApiErrorCode`, so clients share one copy table. */
export const ACTIVITY_SESSION_REJECTION_REASONS = [
  'MOCK_LOCATION_DETECTED',
  'INSUFFICIENT_ACTIVITY_DATA',
  'SNEAKER_TRANSFERRED_DURING_SESSION',
] as const

export type ActivitySessionRejectionReason = (typeof ACTIVITY_SESSION_REJECTION_REASONS)[number]

/**
 * A validation rule that dropped samples, segments or minutes from an accepted
 * session (security.md → Activity validation). Shown to the player on the summary.
 */
export const ACTIVITY_VALIDATION_WARNINGS = [
  'lowGpsAccuracy',
  'deviceClockMismatch',
  'sessionTooLong',
  'teleportDetected',
  'samplingGap',
  'vehicleSpeedDetected',
] as const

export type ActivityValidationWarning = (typeof ACTIVITY_VALIDATION_WARNINGS)[number]
