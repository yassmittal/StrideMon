// The browser side of `GET /v1/pass/collection` (D-043, D-044). The site never imports
// `@stridemon/shared` (D-035), so this mirrors the API's response by hand and checks it as it reads.

import {
  PASS_SCHEDULE_PHASES,
  type PassSchedulePhase,
  type PassScheduleTimes,
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
  /** The last 10 confirmed mints, newest first. */
  recentMints: readonly RecentPassMint[]
  scheduleTimes: PassScheduleTimes
  /** The API's phase when it answered. The page recomputes it from the times and the clock. */
  phase: PassSchedulePhase
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

function parsePassCollection(body: unknown): PassCollection | null {
  if (!isRecord(body) || !isRecord(body.schedule)) return null
  const { schedule } = body
  const phase = schedule.phase
  const mintedDesignNumbers = readDesignNumbers(body.mintedDesignNumbers)
  const pendingDesignNumbers = readDesignNumbers(body.pendingDesignNumbers)
  if (
    typeof body.designCount !== 'number' ||
    typeof body.mintedCount !== 'number' ||
    mintedDesignNumbers === null ||
    pendingDesignNumbers === null ||
    !Array.isArray(body.recentMints) ||
    !isPassSchedulePhase(phase) ||
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
    phase,
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

/** The mint behind "Minted by 0x3fA1…c9a1", when it's one of the last 10 (D-044). */
export function findRecentPassMint(
  collection: PassCollection | null,
  designNumber: number,
): RecentPassMint | null {
  return (
    collection?.recentMints.find((recentMint) => recentMint.designNumber === designNumber) ?? null
  )
}
