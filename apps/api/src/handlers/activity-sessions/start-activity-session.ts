import type { StrideMonContractAddresses } from '@stridemon/chain'
import type { ActivitySessionResponse } from '@stridemon/shared/api-contracts'
import { type Db, ObjectId } from 'mongodb'
import type { PublicClient } from 'viem'
import { ApiError } from '../../common/api-error'
import { buildOnChainSessionId } from '../../lib/activity-sessions/build-on-chain-session-id'
import type { AuthenticatedUser } from '../../plugins/authentication'
import {
  findActiveActivitySessionForWalletOrSneaker,
  insertActiveActivitySession,
} from '../../repositories/activity-sessions-repository'
import {
  listSneakerTokenIdsOwnedBy,
  readSneakerState,
  type SneakerState,
} from '../../services/sneaker-chain-reader'
import { toActivitySession } from './to-activity-session'

const HTTP_STATUS_FORBIDDEN = 403
const HTTP_STATUS_CONFLICT = 409

/**
 * Starts a walk or run with one of the player's Sneakers, after checking the
 * chain (game-rules.md → Starting a session): the player owns it, and it has
 * energy and durability left. One active session per wallet and per Sneaker is
 * enforced by the database.
 */
export async function startActivitySession({
  database,
  publicClient,
  contractAddresses,
  authenticatedUser,
  sneakerTokenId,
  now,
}: {
  database: Db
  publicClient: PublicClient
  contractAddresses: StrideMonContractAddresses
  authenticatedUser: AuthenticatedUser
  sneakerTokenId: bigint
  now: Date
}): Promise<ActivitySessionResponse> {
  const chainReaderContext = { publicClient, contractAddresses }
  const ownedSneakerTokenIds = await listSneakerTokenIdsOwnedBy(
    chainReaderContext,
    authenticatedUser.walletAddress,
  )
  if (!ownedSneakerTokenIds.includes(sneakerTokenId)) {
    throw new ApiError('SNEAKER_NOT_OWNED', HTTP_STATUS_FORBIDDEN, {
      sneakerTokenId: sneakerTokenId.toString(),
    })
  }
  const sneakerState = await readSneakerState(chainReaderContext, sneakerTokenId)
  assertSneakerCanStartActivitySession(sneakerState)

  const activitySessionId = new ObjectId()
  const activitySession = await insertActiveActivitySession(database, {
    activitySessionId,
    userId: new ObjectId(authenticatedUser.userId),
    walletAddress: authenticatedUser.walletAddress,
    sneakerTokenId: sneakerTokenId.toString(),
    onChainSessionId: buildOnChainSessionId(activitySessionId.toHexString()),
    energyAtStart: sneakerState.currentEnergy,
    now,
  })
  if (activitySession === null) {
    throw await buildAlreadyActiveError({ database, authenticatedUser, sneakerTokenId })
  }
  return { activitySession: toActivitySession(activitySession) }
}

function assertSneakerCanStartActivitySession(sneakerState: SneakerState): void {
  const sneakerTokenId = sneakerState.sneakerTokenId.toString()
  if (sneakerState.currentEnergy < 1) {
    throw new ApiError('SNEAKER_OUT_OF_ENERGY', HTTP_STATUS_CONFLICT, {
      sneakerTokenId,
      currentEnergy: sneakerState.currentEnergy,
    })
  }
  if (sneakerState.durability < 1) {
    throw new ApiError('SNEAKER_NEEDS_REPAIR', HTTP_STATUS_CONFLICT, {
      sneakerTokenId,
      durability: sneakerState.durability,
    })
  }
}

/** Names the session in the way, so the app can offer to resume it. */
async function buildAlreadyActiveError({
  database,
  authenticatedUser,
  sneakerTokenId,
}: {
  database: Db
  authenticatedUser: AuthenticatedUser
  sneakerTokenId: bigint
}): Promise<ApiError> {
  const activeActivitySession = await findActiveActivitySessionForWalletOrSneaker(database, {
    walletAddress: authenticatedUser.walletAddress,
    sneakerTokenId: sneakerTokenId.toString(),
  })
  // Only the player's own session is named: another wallet's Sneaker id is theirs to know.
  const isOwnActivitySession =
    activeActivitySession !== null &&
    activeActivitySession.userId.toHexString() === authenticatedUser.userId
  return new ApiError(
    'ACTIVITY_SESSION_ALREADY_ACTIVE',
    HTTP_STATUS_CONFLICT,
    isOwnActivitySession ? { activitySessionId: activeActivitySession._id.toHexString() } : {},
  )
}
