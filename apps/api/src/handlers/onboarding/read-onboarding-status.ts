import type { OnboardingStatusResponse } from '@stridemon/shared/api-contracts'
import type { Db } from 'mongodb'
import {
  buildGasDripIdempotencyKey,
  buildStarterSneakerIdempotencyKey,
} from '../../lib/chain-transactions/chain-transaction-payloads'
import { toOnboardingStep } from '../../lib/onboarding/to-onboarding-step'
import type { AuthenticatedUser } from '../../plugins/authentication'
import { findChainTransactionByIdempotencyKey } from '../../repositories/chain-transactions-repository'

/** Where the player's starter mint and gas drip are in the outbox. */
export async function readOnboardingStatus({
  database,
  authenticatedUser,
}: {
  database: Db
  authenticatedUser: AuthenticatedUser
}): Promise<OnboardingStatusResponse> {
  const { walletAddress } = authenticatedUser
  const [starterSneakerTransaction, gasDripTransaction] = await Promise.all([
    findChainTransactionByIdempotencyKey(
      database,
      buildStarterSneakerIdempotencyKey(walletAddress),
    ),
    findChainTransactionByIdempotencyKey(database, buildGasDripIdempotencyKey(walletAddress)),
  ])
  return {
    starterSneaker: toOnboardingStep(starterSneakerTransaction),
    gasDrip: toOnboardingStep(gasDripTransaction),
  }
}
