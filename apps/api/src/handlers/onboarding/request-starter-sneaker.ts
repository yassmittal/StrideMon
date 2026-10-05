import type { OnboardingStatusResponse } from '@stridemon/shared/api-contracts'
import type { Db } from 'mongodb'
import {
  buildGasDripIdempotencyKey,
  buildStarterSneakerIdempotencyKey,
  type MintStarterSneakerPayload,
  type SendGasDripPayload,
} from '../../lib/chain-transactions/chain-transaction-payloads'
import type { AuthenticatedUser } from '../../plugins/authentication'
import type { ApiConfig } from '../../plugins/env'
import { enqueueChainTransaction } from '../../repositories/chain-transactions-repository'
import { readOnboardingStatus } from './read-onboarding-status'

/**
 * Queues the player's starter Sneaker, then their gas drip (D-009). Safe to call
 * on every sign-in: the outbox keys are per wallet, so repeats return the
 * existing records, and the contract refuses a second starter Sneaker anyway.
 */
export async function requestStarterSneaker({
  database,
  apiConfig,
  authenticatedUser,
  now,
}: {
  database: Db
  apiConfig: ApiConfig
  authenticatedUser: AuthenticatedUser
  now: Date
}): Promise<OnboardingStatusResponse> {
  // Lowercase, like every stored wallet address (data-model.md).
  const walletAddress = authenticatedUser.walletAddress.toLowerCase()

  const mintPayload: MintStarterSneakerPayload = { walletAddress }
  await enqueueChainTransaction(database, {
    kind: 'mintStarterSneaker',
    idempotencyKey: buildStarterSneakerIdempotencyKey(walletAddress),
    payload: mintPayload,
    now,
  })

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

  return readOnboardingStatus({ database, authenticatedUser })
}
