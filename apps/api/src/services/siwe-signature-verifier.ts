import type { Address, Hex, PublicClient } from 'viem'

type IsSiweSignatureValidOptions = {
  message: string
  signature: Hex
  siweDomain: string
  nonce: string
  walletAddress: Address
  now: Date
}

/**
 * Checks the message's domain, nonce, address and time window, then the signature.
 * It goes through the chain, so smart-contract wallets (ERC-1271 / ERC-6492) pass as
 * well as plain accounts.
 */
export function isSiweSignatureValid(
  publicClient: PublicClient,
  { message, signature, siweDomain, nonce, walletAddress, now }: IsSiweSignatureValidOptions,
): Promise<boolean> {
  return publicClient.verifySiweMessage({
    message,
    signature,
    domain: siweDomain,
    nonce,
    address: walletAddress,
    time: now,
  })
}
