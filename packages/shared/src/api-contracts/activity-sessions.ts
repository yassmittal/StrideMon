import { z } from 'zod'
import {
  ACTIVITY_SESSION_REJECTION_REASONS,
  ACTIVITY_SESSION_STATUSES,
  ACTIVITY_VALIDATION_WARNINGS,
} from '../domain/activity-session'
import { tokenIdStringSchema } from './token-id'

/** security.md → API hardening: an upper bound on samples per upload request. */
export const MAX_LOCATION_SAMPLES_PER_UPLOAD = 500

const MAXIMUM_LATITUDE_DEGREES = 90
const MAXIMUM_LONGITUDE_DEGREES = 180

export const startActivitySessionBodySchema = z.object({
  sneakerTokenId: tokenIdStringSchema,
})
export type StartActivitySessionBody = z.infer<typeof startActivitySessionBodySchema>

export const activitySessionParamsSchema = z.object({
  activitySessionId: z.string().regex(/^[0-9a-f]{24}$/, 'must be an activity session id'),
})
export type ActivitySessionParams = z.infer<typeof activitySessionParamsSchema>

/** One GPS fix as the device recorded it. Raw GPS never leaves the API (security.md → Privacy). */
export const locationSampleSchema = z.object({
  /** Assigned on the device, starting at 0. Makes re-uploading a batch a no-op. */
  sequenceNumber: z.int().nonnegative(),
  /** The device's timestamp of the fix. */
  recordedAt: z.iso.datetime(),
  latitude: z.number().min(-MAXIMUM_LATITUDE_DEGREES).max(MAXIMUM_LATITUDE_DEGREES),
  longitude: z.number().min(-MAXIMUM_LONGITUDE_DEGREES).max(MAXIMUM_LONGITUDE_DEGREES),
  accuracyMeters: z.number().nonnegative().nullable(),
  /** As the device reported it. iOS sends -1 when it has no speed. Not used for validation. */
  speedMetersPerSecond: z.number().nullable(),
  /** Android only; iOS always sends false (D-020). */
  isMockedLocation: z.boolean(),
})
export type LocationSample = z.infer<typeof locationSampleSchema>

export const uploadLocationSamplesBodySchema = z.object({
  samples: z.array(locationSampleSchema).min(1).max(MAX_LOCATION_SAMPLES_PER_UPLOAD),
})
export type UploadLocationSamplesBody = z.infer<typeof uploadLocationSamplesBodySchema>

export const uploadLocationSamplesResponseSchema = z.object({
  newSampleCount: z.int().nonnegative(),
  /** Samples the API already had (a retried batch). */
  duplicateSampleCount: z.int().nonnegative(),
})
export type UploadLocationSamplesResponse = z.infer<typeof uploadLocationSamplesResponseSchema>

export const activityValidationResultSchema = z.object({
  activeMinutes: z.int().nonnegative(),
  distanceMeters: z.int().nonnegative(),
  averageSpeedKilometersPerHour: z.number().nonnegative(),
  rejectedSampleCount: z.int().nonnegative(),
  warnings: z.array(z.enum(ACTIVITY_VALIDATION_WARNINGS)),
})
export type ActivityValidationResult = z.infer<typeof activityValidationResultSchema>

export const activitySessionSchema = z.object({
  activitySessionId: z.string(),
  sneakerTokenId: tokenIdStringSchema,
  status: z.enum(ACTIVITY_SESSION_STATUSES),
  startedAt: z.iso.datetime(),
  finishedAt: z.iso.datetime().nullable(),
  /** Read from the chain at start, for display. */
  energyAtStart: z.int().nonnegative(),
  /** Set once validation accepted the session. */
  validationResult: activityValidationResultSchema.nullable(),
  /** Set once validation rejected the session. */
  rejectionReason: z.enum(ACTIVITY_SESSION_REJECTION_REASONS).nullable(),
})
export type ActivitySession = z.infer<typeof activitySessionSchema>

/** Returned by start, finish and get-one (backend-api.md → Activity session responses). */
export const activitySessionResponseSchema = z.object({
  activitySession: activitySessionSchema,
})
export type ActivitySessionResponse = z.infer<typeof activitySessionResponseSchema>
