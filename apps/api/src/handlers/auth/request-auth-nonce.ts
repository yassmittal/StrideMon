import type { AuthNonceResponse } from '@stridemon/shared/api-contracts'
import type { Db } from 'mongodb'
import { getAddress } from 'viem'
import { buildSiweMessage } from '../../lib/auth/build-siwe-message'
import { generateSiweNonce } from '../../lib/auth/generate-siwe-nonce'
import type { ApiConfig } from '../../plugins/env'
import { insertAuthNonce } from '../../repositories/auth-nonces-repository'

// security.md: the message expires 5 minutes after it's issued.
const SIWE_MESSAGE_TTL_MILLISECONDS = 5 * 60 * 1000

type RequestAuthNonceOptions = {
  database: Db
  apiConfig: ApiConfig
  walletAddress: string
  now: Date
}

/** Issues a one-time nonce for this wallet and returns the SIWE message that carries it. */
export async function requestAuthNonce({
  database,
  apiConfig,
  walletAddress,
  now,
}: RequestAuthNonceOptions): Promise<AuthNonceResponse> {
  const nonce = generateSiweNonce()
  const expiresAt = new Date(now.getTime() + SIWE_MESSAGE_TTL_MILLISECONDS)

  await insertAuthNonce(database, { nonce, walletAddress, expiresAt, createdAt: now })

  const message = buildSiweMessage({
    siweDomain: apiConfig.siweDomain,
    walletAddress: getAddress(walletAddress),
    chainId: apiConfig.monadChain.id,
    nonce,
    issuedAt: now,
    expiresAt,
  })
  return { message }
}
