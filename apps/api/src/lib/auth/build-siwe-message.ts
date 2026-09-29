import type { Address } from 'viem'
import { createSiweMessage } from 'viem/siwe'

const SIWE_STATEMENT = 'Sign in to StrideMon. This proves you own this wallet. It costs nothing.'

type BuildSiweMessageOptions = {
  siweDomain: string
  walletAddress: Address
  chainId: number
  nonce: string
  issuedAt: Date
  expiresAt: Date
}

/**
 * The EIP-4361 message the wallet signs. The API builds it in full, so every
 * field that verify later checks (domain, chain, nonce, expiry) is one we chose.
 */
export function buildSiweMessage({
  siweDomain,
  walletAddress,
  chainId,
  nonce,
  issuedAt,
  expiresAt,
}: BuildSiweMessageOptions): string {
  return createSiweMessage({
    domain: siweDomain,
    uri: `https://${siweDomain}`,
    address: walletAddress,
    chainId,
    nonce,
    issuedAt,
    expirationTime: expiresAt,
    statement: SIWE_STATEMENT,
    version: '1',
  })
}
