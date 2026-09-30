/** Why the phone couldn't start or keep recording a run. Screens switch on `code`. */
export type LocationTrackingErrorCode =
  | 'LOCATION_SERVICES_OFF'
  | 'LOCATION_PERMISSION_MISSING'
  | 'LOCATION_TRACKING_FAILED'

export class LocationTrackingError extends Error {
  readonly code: LocationTrackingErrorCode

  constructor(code: LocationTrackingErrorCode, message: string) {
    super(message)
    this.name = 'LocationTrackingError'
    this.code = code
  }
}
