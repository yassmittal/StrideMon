import {
  type AuthTokensResponse,
  authNonceResponseSchema,
  authTokensResponseSchema,
} from '@stridemon/shared/api-contracts'
import type { FastifyInstance } from 'fastify'
import type { PrivateKeyAccount } from 'viem/accounts'

/**
 * Signs a test wallet in through the real nonce → sign → verify routes. The
 * server needs a `startTestChain()` RPC, because verification makes an `eth_call`.
 */
export async function signInTestPlayer(
  server: FastifyInstance,
  playerAccount: PrivateKeyAccount,
): Promise<AuthTokensResponse> {
  const nonceResponse = await server.inject({
    method: 'POST',
    url: '/v1/auth/nonce',
    payload: { walletAddress: playerAccount.address },
  })
  const { message } = authNonceResponseSchema.parse(nonceResponse.json())
  const verifyResponse = await server.inject({
    method: 'POST',
    url: '/v1/auth/verify',
    payload: { message, signature: await playerAccount.signMessage({ message }) },
  })
  return authTokensResponseSchema.parse(verifyResponse.json())
}
