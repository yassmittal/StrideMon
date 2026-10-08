import type { FoundingPassCollectionResponse } from '@stridemon/shared/api-contracts'
import { FOUNDING_PASS_DESIGN_COUNT } from '@stridemon/shared/domain'
import type { Db } from 'mongodb'
import { getAddress } from 'viem'
import {
  calculatePassSchedulePosition,
  isEarlyAccessGateOn,
} from '../../lib/founding-pass/pass-schedule'
import type { ApiConfig } from '../../plugins/env'
import {
  listPendingFoundingPassDesignNumbers,
  listRecentConfirmedFoundingPassMints,
} from '../../repositories/founding-pass-mints-repository'
import type { CachedFoundingPassCollectionReader } from '../../services/cached-founding-pass-collection-reader'

const RECENT_MINT_COUNT = 10

/**
 * The gallery's live state (backend-api.md → The Founding Pass): which designs are minted (the
 * chain, cached a few seconds), which are on their way, the last 10 mints, the schedule, the gate.
 */
export async function readFoundingPassCollection({
  database,
  apiConfig,
  collectionReader,
  now,
}: {
  database: Db
  apiConfig: ApiConfig
  collectionReader: CachedFoundingPassCollectionReader
  now: Date
}): Promise<FoundingPassCollectionResponse> {
  const collectionState = await collectionReader.read(now)
  const [pendingDesignNumbers, recentMints] = await Promise.all([
    listPendingFoundingPassDesignNumbers(database, { confirmedSince: collectionState.readAt }),
    listRecentConfirmedFoundingPassMints(database, RECENT_MINT_COUNT),
  ])
  const mintedDesignNumbers = new Set(collectionState.mintedDesignNumbers)
  const { passScheduleTimes } = apiConfig
  const schedulePosition = calculatePassSchedulePosition({
    scheduleTimes: passScheduleTimes,
    mintedCount: collectionState.mintedCount,
    now,
  })

  return {
    designCount: FOUNDING_PASS_DESIGN_COUNT,
    mintedCount: collectionState.mintedCount,
    mintedDesignNumbers: collectionState.mintedDesignNumbers,
    pendingDesignNumbers: [...new Set(pendingDesignNumbers)]
      .filter((designNumber) => !mintedDesignNumbers.has(designNumber))
      .sort((left, right) => left - right),
    recentMints: recentMints.flatMap((recentMint) =>
      recentMint.founderNumber === null || recentMint.mintedAt === null
        ? []
        : [
            {
              designNumber: recentMint.designNumber,
              walletAddress: getAddress(recentMint.walletAddress),
              founderNumber: recentMint.founderNumber,
              mintedAt: recentMint.mintedAt.toISOString(),
            },
          ],
    ),
    schedule: {
      phase: schedulePosition.phase,
      nextPhaseAt: schedulePosition.nextPhaseAt?.toISOString() ?? null,
      waitlistWindowStartsAt: passScheduleTimes.waitlistWindowStartsAt.toISOString(),
      openMintStartsAt: passScheduleTimes.openMintStartsAt.toISOString(),
      backupOpeningAt: passScheduleTimes.backupOpeningAt.toISOString(),
    },
    isEarlyAccessGateOn: isEarlyAccessGateOn({
      isEarlyAccessRequired: apiConfig.isEarlyAccessRequired,
      phase: schedulePosition.phase,
    }),
  }
}
