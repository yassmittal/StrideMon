import { foundingPassAbi } from '@stridemon/chain'
import type { FastifyInstance } from 'fastify'
import { type Address, createTestClient, createWalletClient, http, numberToHex, pad } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { signEmailProof } from '../lib/founding-pass/email-proof'
import { TEST_EMAIL_PROOF_SECRET } from './build-test-server'
import { ANVIL_GAME_SERVER_PRIVATE_KEY } from './deploy-test-contracts'

// `forge inspect FoundingPass storageLayout`: `mintedCount` is slot 12. The test that moves it
// reads it back, so a changed layout fails loudly.
const FOUNDING_PASS_MINTED_COUNT_STORAGE_SLOT = pad(numberToHex(12))

/**
 * Mints a pass straight on the test chain, from the game-server key (it holds `MINTER_ROLE`), the
 * way a pass minted outside the API (or recovered to a new wallet) looks to the API.
 */
export async function mintFoundingPassOnChain(
  server: FastifyInstance,
  { walletAddress, designNumber }: { walletAddress: Address; designNumber: number },
): Promise<void> {
  const gameServerWalletClient = createWalletClient({
    account: privateKeyToAccount(ANVIL_GAME_SERVER_PRIVATE_KEY),
    chain: server.config.monadChain,
    transport: http(server.config.monadRpcUrl),
  })
  const transactionHash = await gameServerWalletClient.writeContract({
    address: server.config.contractAddresses.foundingPass,
    abi: foundingPassAbi,
    functionName: 'mint',
    args: [walletAddress, BigInt(designNumber)],
  })
  const receipt = await server.chain.publicClient.waitForTransactionReceipt({
    hash: transactionHash,
  })
  if (receipt.status !== 'success') throw new Error(`Test pass mint reverted: ${transactionHash}`)
}

/** Sets `FoundingPass.mintedCount` on the test chain, to stand in for "all 1,000 minted". */
export async function setFoundingPassMintedCountOnChain(
  server: FastifyInstance,
  mintedCount: number,
): Promise<void> {
  const testClient = createTestClient({
    mode: 'anvil',
    chain: server.config.monadChain,
    transport: http(server.config.monadRpcUrl),
  })
  await testClient.setStorageAt({
    address: server.config.contractAddresses.foundingPass,
    index: FOUNDING_PASS_MINTED_COUNT_STORAGE_SLOT,
    value: pad(numberToHex(mintedCount)),
  })
}

/** An email proof as `POST /v1/pass/email-verify` would give it, signed with the tests' secret. */
export async function signTestEmailProof(email: string): Promise<string> {
  const { emailProof } = await signEmailProof({
    email,
    emailProofSecret: TEST_EMAIL_PROOF_SECRET,
    issuedAt: new Date(),
  })
  return emailProof
}
