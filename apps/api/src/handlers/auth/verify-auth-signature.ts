import type { AuthTokensResponse } from '@stridemon/shared/api-contracts'
import type { Db } from 'mongodb'
import type { Hex, PublicClient } from 'viem'
import { parseSiweMessage } from 'viem/siwe'
import { ApiError } from '../../common/api-error'
import type { ApiConfig } from '../../plugins/env'
import { deleteUnexpiredAuthNonce } from '../../repositories/auth-nonces-repository'
import { upsertUserOnSignIn } from '../../repositories/users-repository'
import { isSiweSignatureValid } from '../../services/siwe-signature-verifier'
import { issueAuthTokens } from './issue-auth-tokens'

const HTTP_STATUS_UNAUTHORIZED = 401

type VerifyAuthSignatureOptions = {
  database: Db
  publicClient: PublicClient
  apiConfig: ApiConfig
  message: string
  signature: Hex
  now: Date
}

/**
 * Signs a wallet in: the message must carry a live nonce issued to that wallet,
 * name our domain and chain, and be signed by the wallet. The nonce is used up
 * before the signature is checked, so a message can never be tried twice.
 */
export async function verifyAuthSignature({
  database,
  publicClient,
  apiConfig,
  message,
  signature,
  now,
}: VerifyAuthSignatureOptions): Promise<AuthTokensResponse> {
  const siweMessage = parseSiweMessage(message)
  if (siweMessage.nonce === undefined || siweMessage.address === undefined) {
    throw new ApiError('INVALID_SIGNATURE', HTTP_STATUS_UNAUTHORIZED)
  }

  const authNonce = await deleteUnexpiredAuthNonce(database, { nonce: siweMessage.nonce, now })
  if (authNonce === null) throw new ApiError('NONCE_EXPIRED', HTTP_STATUS_UNAUTHORIZED)

  const isIssuedForThisWalletAndChain =
    authNonce.walletAddress === siweMessage.address.toLowerCase() &&
    siweMessage.chainId === apiConfig.monadChain.id
  if (!isIssuedForThisWalletAndChain) {
    throw new ApiError('INVALID_SIGNATURE', HTTP_STATUS_UNAUTHORIZED)
  }

  const isSignatureValid = await isSiweSignatureValid(publicClient, {
    message,
    signature,
    siweDomain: apiConfig.siweDomain,
    nonce: siweMessage.nonce,
    walletAddress: siweMessage.address,
    now,
  })
  if (!isSignatureValid) throw new ApiError('INVALID_SIGNATURE', HTTP_STATUS_UNAUTHORIZED)

  const userDocument = await upsertUserOnSignIn(database, {
    walletAddress: siweMessage.address,
    signedInAt: now,
  })
  return issueAuthTokens({ database, apiConfig, userDocument, now })
}
