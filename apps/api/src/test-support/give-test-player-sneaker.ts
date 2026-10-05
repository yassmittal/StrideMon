import type { FastifyInstance } from 'fastify'
import type { Address } from 'viem'
import { listSneakerTokenIdsOwnedBy } from '../services/sneaker-chain-reader'
import { runOutboxJob } from './run-outbox-job'

/**
 * Gives a signed-in test player their starter Sneaker the way the app does it:
 * the onboarding route, then one outbox run. Returns the Sneaker's token id.
 * Needs a server built with a `startTestChain()` RPC and `deployTestContracts()` addresses.
 */
export async function giveTestPlayerSneaker(
  server: FastifyInstance,
  { accessToken, walletAddress }: { accessToken: string; walletAddress: Address },
): Promise<bigint> {
  const onboardingResponse = await server.inject({
    method: 'POST',
    url: '/v1/onboarding/starter-sneaker',
    headers: { authorization: `Bearer ${accessToken}` },
  })
  if (onboardingResponse.statusCode !== 200) {
    throw new Error(`Starter Sneaker request failed: ${onboardingResponse.body}`)
  }
  await runOutboxJob(server)

  const [sneakerTokenId] = await listSneakerTokenIdsOwnedBy(
    { publicClient: server.chain.publicClient, contractAddresses: server.config.contractAddresses },
    walletAddress,
  )
  if (sneakerTokenId === undefined) throw new Error('The outbox minted no starter Sneaker')
  return sneakerTokenId
}
