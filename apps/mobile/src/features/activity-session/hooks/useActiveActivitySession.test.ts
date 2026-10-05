import { FIXTURE_GAME_CONFIG } from '@stridemon/shared/game-rules/fixtures'
import { renderHook, waitFor } from '@testing-library/react-native'
import { ApiError } from '../../../lib/api-client'
import type { LocalDatabase } from '../location-tracking/activity-session-database'
import { ensureLocationTracking } from '../location-tracking/ensure-location-tracking'
import { createInMemoryActivitySessionDatabase } from '../location-tracking/in-memory-database.test-support'
import { appendLocationSamples } from '../location-tracking/location-sample-buffer'
import { uploadUnsentLocationSamples } from '../location-tracking/location-sample-uploader'
import { LocationTrackingError } from '../location-tracking/location-tracking-error'
import { useActiveActivitySession } from './useActiveActivitySession'

let mockDatabase: LocalDatabase

jest.mock('../location-tracking/activity-session-database', () => ({
  ...jest.requireActual('../location-tracking/activity-session-database'),
  openActivitySessionDatabase: () => Promise.resolve(mockDatabase),
}))
jest.mock('../location-tracking/ensure-location-tracking', () => ({
  ensureLocationTracking: jest.fn(),
}))
jest.mock('../location-tracking/location-sample-uploader', () => ({
  ...jest.requireActual('../location-tracking/location-sample-uploader'),
  uploadUnsentLocationSamples: jest.fn(),
}))

const ACTIVITY_SESSION_ID = '66f9c0ffee00000000000001'
const LOCAL_ACTIVE_ACTIVITY_SESSION = {
  activitySessionId: ACTIVITY_SESSION_ID,
  sneakerTokenId: 7n,
  startedAt: new Date(Date.now() - 90_000).toISOString(),
  energyAtStart: 10,
  efficiency: 10,
}

beforeEach(async () => {
  mockDatabase = await createInMemoryActivitySessionDatabase()
  jest.mocked(ensureLocationTracking).mockReset().mockResolvedValue(undefined)
  jest.mocked(uploadUnsentLocationSamples).mockReset().mockResolvedValue(undefined)
})

function renderActiveActivitySession() {
  return renderHook(() =>
    useActiveActivitySession({
      localActiveActivitySession: LOCAL_ACTIVE_ACTIVITY_SESSION,
      gameConfig: FIXTURE_GAME_CONFIG,
    }),
  )
}

describe('useActiveActivitySession', () => {
  it('shows live stats from the buffered samples', async () => {
    await appendLocationSamples(mockDatabase, {
      activitySessionId: ACTIVITY_SESSION_ID,
      recordedLocations: [0, 1].map((index) => ({
        recordedAtMilliseconds: Date.now() - 6_000 + index * 3_000,
        latitude: 26.8923 + index * 0.0001,
        longitude: 75.8042,
        accuracyMeters: 8,
        speedMetersPerSecond: 1.4,
        isMockedLocation: false,
      })),
    })

    const { result, unmount } = await renderActiveActivitySession()

    await waitFor(() => expect(result.current.liveRunStats).toBeDefined())
    expect(result.current.liveRunStats).toMatchObject({
      recordedSampleCount: 2,
      estimatedEnergyLeft: 9,
      estimatedRewardWei: 5n * 10n ** 18n,
    })
    expect(result.current.liveRunStats?.distanceMeters).toBeCloseTo(11.1, 0)
    expect(result.current.unsentSampleCount).toBe(2)
    await unmount()
  })

  it('uploads as soon as the run screen opens', async () => {
    const { unmount } = await renderActiveActivitySession()

    await waitFor(() =>
      expect(uploadUnsentLocationSamples).toHaveBeenCalledWith(ACTIVITY_SESSION_ID),
    )
    await unmount()
  })

  it('reports an upload failure by code, keeping the samples', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    jest
      .mocked(uploadUnsentLocationSamples)
      .mockRejectedValue(
        new ApiError({ code: 'NETWORK_UNREACHABLE', message: 'offline', statusCode: null }),
      )

    const { result, unmount } = await renderActiveActivitySession()

    await waitFor(() => expect(result.current.uploadErrorCode).toBe('NETWORK_UNREACHABLE'))
    await unmount()
  })

  it('says why GPS isn’t recording, and records again on retry', async () => {
    jest
      .mocked(ensureLocationTracking)
      .mockRejectedValueOnce(new LocationTrackingError('LOCATION_SERVICES_OFF', 'off'))

    const { result, unmount } = await renderActiveActivitySession()
    await waitFor(() => expect(result.current.trackingError).toBeInstanceOf(LocationTrackingError))

    result.current.retryTracking()

    await waitFor(() => expect(result.current.trackingError).toBeNull())
    await unmount()
  })
})
