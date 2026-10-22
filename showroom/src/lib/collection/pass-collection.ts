// The browser side of `GET /v1/pass/collection` (D-043, D-044), copied by hand from the website's
// `src/lib/founding-pass/pass-collection.ts` (the showroom never imports `@stridemon/*`, brief
// §7.3). It mirrors the API's response and checks it as it reads. The showroom opens it from its
// own CORS list, `SHOWROOM_ALLOWED_ORIGINS` (D-066).

import {
  calculatePassSchedulePhase,
  PASS_SCHEDULE_PHASES,
  type PassSchedulePhase,
  type PassScheduleTimes,
  plannedPassScheduleTimes,
} from './pass-schedule'

export type RecentPassMint = {
  designNumber: number
  /** EIP-55 checksummed. */
  walletAddress: `0x${string}`
  founderNumber: number
  mintedAt: string
}

export type PassCollection = {
  designCount: number
  mintedCount: number
  mintedDesignNumbers: ReadonlySet<number>
  /** Queued mints, and mints confirmed since the API last read the chain. */
  pendingDesignNumbers: ReadonlySet<number>
  /** The last 10 confirmed mints, newest first: the only ones with a founder number (D-066). */
  recentMints: readonly RecentPassMint[]
  scheduleTimes: PassScheduleTimes
}

export type PassAvailability = 'available' | 'pending' | 'minted'

const REQUEST_TIMEOUT_MILLISECONDS = 10_000

export function readPassAvailability(
  collection: PassCollection | null,
  designNumber: number,
): PassAvailability | null {
  if (collection === null) return null
  if (collection.mintedDesignNumbers.has(designNumber)) return 'minted'
  if (collection.pendingDesignNumbers.has(designNumber)) return 'pending'
  return 'available'
}

/** Minted or on its way: nobody else can take it. */
export function listTakenDesignNumbers(collection: PassCollection | null): ReadonlySet<number> {
  if (collection === null) return new Set()
  return new Set([...collection.mintedDesignNumbers, ...collection.pendingDesignNumbers])
}

/** The mint behind "Minted · Founder 42", when it's one of the last 10. */
export function findRecentPassMint(
  collection: PassCollection | null,
  designNumber: number,
): RecentPassMint | null {
  return (
    collection?.recentMints.find((recentMint) => recentMint.designNumber === designNumber) ?? null
  )
}

/** Where the schedule is now: the API's times, or the planned ones until it answers. */
export function readPassSchedulePhase(
  collection: PassCollection | null,
  now: Date,
): PassSchedulePhase {
  return calculatePassSchedulePhase({
    scheduleTimes: collection?.scheduleTimes ?? plannedPassScheduleTimes,
    mintedCount: collection?.mintedCount ?? null,
    now,
  })
}

/** The collection, or null when the API can't be reached or answers something unexpected. */
export async function fetchPassCollection(apiUrl: string): Promise<PassCollection | null> {
  try {
    const response = await fetch(apiUrl, {
      headers: { accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MILLISECONDS),
    })
    if (!response.ok) return null
    return parsePassCollection(await response.json())
  } catch {
    // Offline, timed out, blocked by CORS, or not JSON.
    return null
  }
}

export function parsePassCollection(body: unknown): PassCollection | null {
  if (!isRecord(body) || !isRecord(body.schedule)) return null
  const { schedule } = body
  const mintedDesignNumbers = readDesignNumbers(body.mintedDesignNumbers)
  const pendingDesignNumbers = readDesignNumbers(body.pendingDesignNumbers)
  if (
    typeof body.designCount !== 'number' ||
    typeof body.mintedCount !== 'number' ||
    mintedDesignNumbers === null ||
    pendingDesignNumbers === null ||
    !Array.isArray(body.recentMints) ||
    !isPassSchedulePhase(schedule.phase) ||
    !isTimestamp(schedule.waitlistWindowStartsAt) ||
    !isTimestamp(schedule.openMintStartsAt) ||
    !isTimestamp(schedule.backupOpeningAt)
  ) {
    return null
  }
  return {
    designCount: body.designCount,
    mintedCount: body.mintedCount,
    mintedDesignNumbers: new Set(mintedDesignNumbers),
    pendingDesignNumbers: new Set(pendingDesignNumbers),
    recentMints: body.recentMints.flatMap((recentMint) =>
      isRecentPassMint(recentMint) ? [recentMint] : [],
    ),
    scheduleTimes: {
      waitlistWindowStartsAt: schedule.waitlistWindowStartsAt,
      openMintStartsAt: schedule.openMintStartsAt,
      backupOpeningAt: schedule.backupOpeningAt,
    },
  }
}

function readDesignNumbers(value: unknown): number[] | null {
  if (!Array.isArray(value)) return null
  return value.every((entry) => Number.isInteger(entry)) ? (value as number[]) : null
}

function isRecentPassMint(value: unknown): value is RecentPassMint {
  return (
    isRecord(value) &&
    Number.isInteger(value.designNumber) &&
    typeof value.walletAddress === 'string' &&
    /^0x[0-9a-fA-F]{40}$/.test(value.walletAddress) &&
    Number.isInteger(value.founderNumber) &&
    isTimestamp(value.mintedAt)
  )
}

function isPassSchedulePhase(value: unknown): value is PassSchedulePhase {
  return PASS_SCHEDULE_PHASES.some((phase) => phase === value)
}

function isTimestamp(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
