import type { WaitlistCountResponse } from '@stridemon/shared/api-contracts'
import type { Db } from 'mongodb'
import { countWaitlistSignups } from '../../repositories/waitlist-signups-repository'

export type WaitlistCountReader = {
  /** How many have joined, counted at most once per cache period. */
  read: (now: Date) => Promise<WaitlistCountResponse>
}

/**
 * The waitlist's one public number (D-056), cached in the process: every visitor's page asks for
 * it, and it only needs to be about a minute fresh. Requests during a count share it.
 */
export function createWaitlistCountReader({
  database,
  cacheMilliseconds,
}: {
  database: Db
  cacheMilliseconds: number
}): WaitlistCountReader {
  let cachedCount: { signupCount: number; countedAt: Date } | null = null
  let countInFlight: Promise<WaitlistCountResponse> | null = null

  return {
    read: (now) => {
      if (
        cachedCount !== null &&
        now.getTime() - cachedCount.countedAt.getTime() < cacheMilliseconds
      ) {
        return Promise.resolve({ signupCount: cachedCount.signupCount })
      }
      if (countInFlight !== null) return countInFlight
      countInFlight = countWaitlistSignups(database)
        .then((signupCount) => {
          cachedCount = { signupCount, countedAt: now }
          return { signupCount }
        })
        .finally(() => {
          countInFlight = null
        })
      return countInFlight
    },
  }
}
