/** A stored location sample, with only the fields validation reads. */
export type ValidationSample = {
  sequenceNumber: number
  /** The device's clock. */
  recordedAt: Date
  /** The server's clock, when the upload arrived. */
  receivedAt: Date
  latitude: number
  longitude: number
  accuracyMeters: number | null
  isMockedLocation: boolean
}
