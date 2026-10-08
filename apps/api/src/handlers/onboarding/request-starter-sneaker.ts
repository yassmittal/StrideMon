import type { OnboardingStatusResponse } from '@stridemon/shared/api-contracts'
import type { Db } from 'mongodb'
import { ApiError } from '../../common/api-error'
import {
  buildFounderSneakerIdempotencyKey,
  buildGasDripIdempotencyKey,
  buildStarterSneakerIdempotencyKey,
  type MintFounderSneakerPayload,
  type MintStarterSneakerPayload,
  type SendGasDripPayload,
} from '../../lib/chain-transactions/chain-transaction-payloads'
import { enqueueChainTransaction } from '../../repositories/chain-transactions-repository'
import { buildOnboardingStatus, type OnboardingContext } from './read-onboarding-status'
import { readStarterSneakerPlan, type StarterSneakerPlan } from './read-starter-sneaker-plan'

const HTTP_STATUS_FORBIDDEN = 403

/**
 * Queues the player's free Sneaker, then their gas drip (D-009): the Founder Sneaker for a pass
 * holder (even one who already has a normal Sneaker), otherwise the starter Sneaker unless the
 * early-access gate is on (D-043). Safe to call on every sign-in: the outbox keys dedupe repeats,
 * and the contracts refuse a second one anyway.
 */
export async function requestStarterSneaker(
  onboardingContext: OnboardingContext,
): Promise<OnboardingStatusResponse> {
  const { database, apiConfig, authenticatedUser, now, ...chainContext } = onboardingContext
  const starterSneakerPlan = await readStarterSneakerPlan({
    ...chainContext,
    apiConfig,
    walletAddress: authenticatedUser.walletAddress,
    now,
  })
  // Lowercase, like every stored wallet address (data-model.md).
  const walletAddress = authenticatedUser.walletAddress.toLowerCase()

  await enqueueFreeSneaker(database, { starterSneakerPlan, walletAddress, now })

  const gasDripPayload: SendGasDripPayload = {
    walletAddress,
    amountWei: apiConfig.gasDripAmountWei.toString(),
  }
  await enqueueChainTransaction(database, {
    kind: 'sendGasDrip',
    idempotencyKey: buildGasDripIdempotencyKey(walletAddress),
    payload: gasDripPayload,
    now,
  })

  return buildOnboardingStatus({ database, authenticatedUser }, starterSneakerPlan)
}

async function enqueueFreeSneaker(
  database: Db,
  {
    starterSneakerPlan,
    walletAddress,
    now,
  }: { starterSneakerPlan: StarterSneakerPlan; walletAddress: string; now: Date },
): Promise<void> {
  if (starterSneakerPlan.kind === 'founder') {
    if (starterSneakerPlan.founderSneakerTokenId !== null) return
    const founderSneakerPayload: MintFounderSneakerPayload = {
      foundingPassTokenId: starterSneakerPlan.foundingPassTokenId.toString(),
      walletAddress,
    }
    await enqueueChainTransaction(database, {
      kind: 'mintFounderSneaker',
      idempotencyKey: buildFounderSneakerIdempotencyKey(starterSneakerPlan.foundingPassTokenId),
      payload: founderSneakerPayload,
      now,
    })
    return
  }
  if (starterSneakerPlan.isFoundingPassRequired) {
    throw new ApiError('FOUNDING_PASS_REQUIRED', HTTP_STATUS_FORBIDDEN, {
      phase: starterSneakerPlan.phase,
    })
  }
  const mintPayload: MintStarterSneakerPayload = { walletAddress }
  await enqueueChainTransaction(database, {
    kind: 'mintStarterSneaker',
    idempotencyKey: buildStarterSneakerIdempotencyKey(walletAddress),
    payload: mintPayload,
    now,
  })
}
