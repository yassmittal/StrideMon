import type { GameConfig } from '@stridemon/shared/game-rules'
import { useCallback, useEffect, useState } from 'react'
import type { ApiClientErrorCode } from '../../../lib/api-client'
import { ApiError } from '../../../lib/api-client'
import { calculateLiveRunStats, type LiveRunStats } from '../live-run-stats'
import { openActivitySessionDatabase } from '../location-tracking/activity-session-database'
import { ensureLocationTracking } from '../location-tracking/ensure-location-tracking'
import type { LocalActiveActivitySession } from '../location-tracking/local-active-activity-session'
import {
  type BufferedLocationSample,
  countUnsentLocationSamples,
  listBufferedLocationSamples,
} from '../location-tracking/location-sample-buffer'
import {
  LOCATION_SAMPLE_UPLOAD_INTERVAL_MILLISECONDS,
  uploadUnsentLocationSamples,
} from '../location-tracking/location-sample-uploader'

// The clock ticks every second; the buffer is re-read a little less often.
const CLOCK_TICK_MILLISECONDS = 1_000
const BUFFER_READ_INTERVAL_MILLISECONDS = 2_000

export type ActiveActivitySession = {
  /** `undefined` until the buffer has been read once. */
  liveRunStats: LiveRunStats | undefined
  unsentSampleCount: number
  /** The last upload's failure, cleared by the next success. Samples stay buffered. */
  uploadErrorCode: ApiClientErrorCode | null
  /** Why GPS isn't recording, or null while it is. */
  trackingError: unknown
  retryTracking: () => void
}

/**
 * The live run: stats from the buffered samples, a 15 s upload loop while the
 * screen is open (the location task uploads too), and GPS kept running.
 */
export function useActiveActivitySession({
  localActiveActivitySession,
  gameConfig,
}: {
  localActiveActivitySession: LocalActiveActivitySession
  gameConfig: GameConfig
}): ActiveActivitySession {
  const { activitySessionId, startedAt, efficiency, energyAtStart } = localActiveActivitySession
  const nowMilliseconds = useTickingNowMilliseconds()
  const { bufferedSamples, unsentSampleCount } = useBufferedSamples(activitySessionId)
  const uploadErrorCode = useUploadLoop(activitySessionId)
  const { trackingError, retryTracking } = useLocationTrackingGuard()

  const liveRunStats =
    bufferedSamples === undefined
      ? undefined
      : calculateLiveRunStats({
          samples: bufferedSamples,
          startedAtMilliseconds: Date.parse(startedAt),
          nowMilliseconds,
          efficiency,
          energyAtStart,
          gameConfig,
        })
  return { liveRunStats, unsentSampleCount, uploadErrorCode, trackingError, retryTracking }
}

function useTickingNowMilliseconds(): number {
  const [nowMilliseconds, setNowMilliseconds] = useState(Date.now)
  useEffect(() => {
    const intervalHandle = setInterval(
      () => setNowMilliseconds(Date.now()),
      CLOCK_TICK_MILLISECONDS,
    )
    return () => clearInterval(intervalHandle)
  }, [])
  return nowMilliseconds
}

function useBufferedSamples(activitySessionId: string): {
  bufferedSamples: BufferedLocationSample[] | undefined
  unsentSampleCount: number
} {
  const [bufferedSamples, setBufferedSamples] = useState<BufferedLocationSample[]>()
  const [unsentSampleCount, setUnsentSampleCount] = useState(0)

  useEffect(() => {
    let isMounted = true
    async function readBuffer(): Promise<void> {
      const database = await openActivitySessionDatabase()
      const [samples, unsentCount] = await Promise.all([
        listBufferedLocationSamples(database, activitySessionId),
        countUnsentLocationSamples(database, activitySessionId),
      ])
      if (!isMounted) return
      setBufferedSamples(samples)
      setUnsentSampleCount(unsentCount)
    }
    const readBufferAndLog = () =>
      readBuffer().catch((error: unknown) =>
        console.error('Reading the sample buffer failed', error),
      )

    void readBufferAndLog()
    const intervalHandle = setInterval(readBufferAndLog, BUFFER_READ_INTERVAL_MILLISECONDS)
    return () => {
      isMounted = false
      clearInterval(intervalHandle)
    }
  }, [activitySessionId])

  return { bufferedSamples, unsentSampleCount }
}

function useUploadLoop(activitySessionId: string): ApiClientErrorCode | null {
  const [uploadErrorCode, setUploadErrorCode] = useState<ApiClientErrorCode | null>(null)

  useEffect(() => {
    let isMounted = true
    function uploadNow(): void {
      uploadUnsentLocationSamples(activitySessionId)
        .then(() => {
          if (isMounted) setUploadErrorCode(null)
        })
        .catch((error: unknown) => {
          console.warn('Location sample upload failed; will retry', error)
          if (isMounted)
            setUploadErrorCode(error instanceof ApiError ? error.code : 'NETWORK_UNREACHABLE')
        })
    }
    uploadNow()
    const intervalHandle = setInterval(uploadNow, LOCATION_SAMPLE_UPLOAD_INTERVAL_MILLISECONDS)
    return () => {
      isMounted = false
      clearInterval(intervalHandle)
    }
  }, [activitySessionId])

  return uploadErrorCode
}

/** Restarts GPS if it isn't running (a resumed run, or the OS stopped it). */
function useLocationTrackingGuard(): { trackingError: unknown; retryTracking: () => void } {
  const [trackingError, setTrackingError] = useState<unknown>(null)

  const retryTracking = useCallback(() => {
    ensureLocationTracking()
      .then(() => setTrackingError(null))
      .catch((error: unknown) => setTrackingError(error))
  }, [])
  useEffect(retryTracking, [retryTracking])

  return { trackingError, retryTracking }
}
