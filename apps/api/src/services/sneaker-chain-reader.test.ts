import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { monadTestnet, type StrideMonContractAddresses, sneakerGameAbi } from '@stridemon/chain'
import { FIXTURE_GAME_CONFIG } from '@stridemon/shared/game-rules/fixtures'
import { createPublicClient, createWalletClient, http, type PublicClient } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import {
  ANVIL_GAME_SERVER_PRIVATE_KEY,
  deployTestContracts,
  TEST_CONTRACTS_DEPLOY_TIMEOUT_MILLISECONDS,
} from '../test-support/deploy-test-contracts'
import { startTestChain, type TestChain } from '../test-support/start-test-chain'
import { listSneakerTokenIdsOwnedBy, readSneakerState } from './sneaker-chain-reader'

let testChain: TestChain
let contractAddresses: StrideMonContractAddresses
let publicClient: PublicClient

beforeAll(async () => {
  testChain = await startTestChain()
  contractAddresses = await deployTestContracts(testChain.rpcUrl)
  publicClient = createPublicClient({ chain: monadTestnet, transport: http(testChain.rpcUrl) })
}, TEST_CONTRACTS_DEPLOY_TIMEOUT_MILLISECONDS)

afterAll(() => {
  testChain.stop()
})

describe('sneaker chain reader', () => {
  it('finds no Sneakers in a new wallet', async () => {
    const walletAddress = privateKeyToAccount(generatePrivateKey()).address

    expect(
      await listSneakerTokenIdsOwnedBy({ publicClient, contractAddresses }, walletAddress),
    ).toEqual([])
  })

  it('lists the starter Sneaker and reads its stats and full energy from the chain', async () => {
    const walletAddress = privateKeyToAccount(generatePrivateKey()).address
    await mintStarterSneaker(walletAddress)

    const [sneakerTokenId] = await listSneakerTokenIdsOwnedBy(
      { publicClient, contractAddresses },
      walletAddress,
    )
    if (sneakerTokenId === undefined) throw new Error('The starter Sneaker was not listed')
    const sneakerState = await readSneakerState({ publicClient, contractAddresses }, sneakerTokenId)

    expect(sneakerState).toMatchObject({
      sneakerTokenId,
      level: 1,
      efficiency: FIXTURE_GAME_CONFIG.starterEfficiency,
      durability: FIXTURE_GAME_CONFIG.maxDurability,
      storedEnergy: FIXTURE_GAME_CONFIG.maxEnergy,
      currentEnergy: FIXTURE_GAME_CONFIG.maxEnergy,
    })
    expect(sneakerState.energyUpdatedAt).toBeGreaterThan(0n)
  })
})

async function mintStarterSneaker(walletAddress: `0x${string}`): Promise<void> {
  const gameServerWalletClient = createWalletClient({
    account: privateKeyToAccount(ANVIL_GAME_SERVER_PRIVATE_KEY),
    chain: monadTestnet,
    transport: http(testChain.rpcUrl),
  })
  const transactionHash = await gameServerWalletClient.writeContract({
    address: contractAddresses.sneakerGame,
    abi: sneakerGameAbi,
    functionName: 'mintStarterSneaker',
    args: [walletAddress],
  })
  await publicClient.waitForTransactionReceipt({ hash: transactionHash })
}
