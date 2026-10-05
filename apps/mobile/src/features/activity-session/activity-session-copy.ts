import type {
  ActivitySessionRejectionReason,
  ActivitySessionStatus,
  ActivityValidationWarning,
} from '@stridemon/shared/domain'

export type StatusTone = 'neutral' | 'pending' | 'success' | 'danger'

/** The short badge for a session in history. */
export function describeActivitySessionStatus(status: ActivitySessionStatus): {
  label: string
  tone: StatusTone
} {
  switch (status) {
    case 'active':
      return { label: 'In progress', tone: 'pending' }
    case 'validating':
      return { label: 'Checking', tone: 'pending' }
    case 'settling':
      return { label: 'Settling', tone: 'pending' }
    case 'settled':
      return { label: 'Settled', tone: 'success' }
    case 'rejected':
      return { label: 'Didn’t count', tone: 'danger' }
    case 'abandoned':
      return { label: 'Closed', tone: 'neutral' }
    default: {
      const unhandledStatus: never = status
      throw new Error(`Unhandled activity session status: ${String(unhandledStatus)}`)
    }
  }
}

export function describeRejectionReason(
  rejectionReason: ActivitySessionRejectionReason | null,
): string {
  switch (rejectionReason) {
    case 'MOCK_LOCATION_DETECTED':
      return 'This phone reported a simulated location during the run. Turn off any mock-location app and try again.'
    case 'INSUFFICIENT_ACTIVITY_DATA':
      return 'There wasn’t enough GPS data to count this run. Keep it going for at least a minute, outdoors.'
    case 'SNEAKER_TRANSFERRED_DURING_SESSION':
      return 'Your Sneaker changed owner during this run, so it couldn’t earn SOLE.'
    case null:
      return 'The run was rejected.'
    default: {
      const unhandledReason: never = rejectionReason
      throw new Error(`Unhandled rejection reason: ${String(unhandledReason)}`)
    }
  }
}

export function describeWarning(warning: ActivityValidationWarning): string {
  switch (warning) {
    case 'lowGpsAccuracy':
      return 'Some GPS points were too imprecise and were skipped.'
    case 'deviceClockMismatch':
      return 'Some GPS points had times that didn’t match the server clock and were skipped.'
    case 'sessionTooLong':
      return 'Only the first 4 hours of a run count.'
    case 'teleportDetected':
      return 'Some stretches moved faster than 40 km/h (a GPS jump or a vehicle) and didn’t count.'
    case 'samplingGap':
      return 'GPS went quiet for over a minute, so those minutes didn’t count.'
    case 'vehicleSpeedDetected':
      return 'Some minutes were faster than 20 km/h, which looks like a vehicle, so they didn’t count.'
    default: {
      const unhandledWarning: never = warning
      throw new Error(`Unhandled warning: ${String(unhandledWarning)}`)
    }
  }
}
