import type { StrideMonContractAddresses } from '@stridemon/chain'
import type { OnboardingStatusResponse, OnboardingStep } from '@stridemon/shared/api-contracts'
import type { Db } from 'mongodb'
import type { PublicClient } from 'viem'
import {
  buildFounderSneakerIdempotencyKey,
  buildGasDripIdempotencyKey,
  buildStarterSneakerIdempotencyKey,
} from '../../lib/chain-transactions/chain-transaction-payloads'
import { toOnboardingStep } from '../../lib/onboarding/to-onboarding-step'
import type { AuthenticatedUser } from '../../plugins/authentication'
import type { ApiConfig } from '../../plugins/env'
import { findChainTransactionByIdempotencyKey } from '../../repositories/chain-transactions-repository'
import type { CachedFoundingPassCollectionReader } from '../../services/cached-founding-pass-collection-reader'
import { readStarterSneakerPlan, type StarterSneakerPlan } from './read-starter-sneaker-plan'

export type OnboardingContext = {
  database: Db
  publicClient: PublicClient
  contractAddresses: StrideMonContractAddresses
  apiConfig: ApiConfig
  collectionReader: CachedFoundingPassCollectionReader
  authenticatedUser: AuthenticatedUser
  now: Date
}

/** Where the player's free Sneaker and gas drip are in the outbox, and whether the gate holds them. */
export async function readOnboardingStatus(
  onboardingContext: OnboardingContext,
): Promise<OnboardingStatusResponse> {
  const { authenticatedUser, ...chainContext } = onboardingContext
  const starterSneakerPlan = await readStarterSneakerPlan({
    ...chainContext,
    walletAddress: authenticatedUser.walletAddress,
  })
  return buildOnboardingStatus(onboardingContext, starterSneakerPlan)
}

/** The status for a plan already read, so a request doesn't read the chain twice. */
export async function buildOnboardingStatus(
  { database, authenticatedUser }: Pick<OnboardingContext, 'database' | 'authenticatedUser'>,
  starterSneakerPlan: StarterSneakerPlan,
): Promise<OnboardingStatusResponse> {
  const [starterSneaker, gasDripTransaction] = await Promise.all([
    readStarterSneakerStep(database, authenticatedUser, starterSneakerPlan),
    findChainTransactionByIdempotencyKey(
      database,
      buildGasDripIdempotencyKey(authenticatedUser.walletAddress),
    ),
  ])
  return {
    starterSneaker,
    gasDrip: toOnboardingStep(gasDripTransaction),
    starterSneakerKind: starterSneakerPlan.kind,
    isFoundingPassRequired:
      starterSneakerPlan.kind === 'normal' && starterSneakerPlan.isFoundingPassRequired,
  }
}

async function readStarterSneakerStep(
  database: Db,
  authenticatedUser: AuthenticatedUser,
  starterSneakerPlan: StarterSneakerPlan,
): Promise<OnboardingStep> {
  if (starterSneakerPlan.kind === 'normal') {
    return toOnboardingStep(
      await findChainTransactionByIdempotencyKey(
        database,
        buildStarterSneakerIdempotencyKey(authenticatedUser.walletAddress),
      ),
    )
  }
  const founderSneakerTransaction = await findChainTransactionByIdempotencyKey(
    database,
    buildFounderSneakerIdempotencyKey(starterSneakerPlan.foundingPassTokenId),
  )
  // The chain is the truth: a Founder Sneaker that exists is done, whoever minted it.
  if (starterSneakerPlan.founderSneakerTokenId !== null) {
    return {
      status: 'confirmed',
      transactionHash: founderSneakerTransaction?.transactionHash ?? null,
    }
  }
  return toOnboardingStep(founderSneakerTransaction)
}
