import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import { type StrideMonContractAddresses, sneakerGameAbi } from '@stridemon/chain'
import type { FastifyInstance } from 'fastify'
import type { Hash } from 'viem'
import { generatePrivateKey, type PrivateKeyAccount, privateKeyToAccount } from 'viem/accounts'
import { buildStarterSneakerIdempotencyKey } from '../lib/chain-transactions/chain-transaction-payloads'
import {
  type ChainTransactionDocument,
  enqueueChainTransaction,
  findChainTransactionByIdempotencyKey,
  getChainTransactionsCollection,
  markChainTransactionSubmitted,
} from '../repositories/chain-transactions-repository'
import { buildChainTransactionCall } from '../services/chain-transaction-calls'
import { simulateAndSignChainTransaction } from '../services/chain-transaction-sender'
import { listSneakerTokenIdsOwnedBy } from '../services/sneaker-chain-reader'
import { buildTestServer } from '../test-support/build-test-server'
import { deployTestContracts } from '../test-support/deploy-test-contracts'
import { runOutboxJob } from '../test-support/run-outbox-job'
import { startTestChain, type TestChain } from '../test-support/start-test-chain'

let testChain: TestChain
let contractAddresses: StrideMonContractAddresses
let server: FastifyInstance
let playerAccount: PrivateKeyAccount

beforeAll(async () => {
  testChain = await startTestChain()
  contractAddresses = await deployTestContracts(testChain.rpcUrl)
})

afterAll(() => {
  testChain.stop()
})

beforeEach(async () => {
  server = await buildTestServer({ monadRpcUrl: testChain.rpcUrl, contractAddresses })
  playerAccount = privateKeyToAccount(generatePrivateKey())
})

afterEach(async () => {
  await server.close()
})

describe('processChainTransactions', () => {
  it('signs, sends and confirms a queued starter mint', async () => {
    await enqueueStarterMint()

    await runOutboxJob(server)

    const chainTransaction = await readStarterMint()
    expect(chainTransaction).toMatchObject({
      status: 'confirmed',
      attemptCount: 1,
      lastError: null,
    })
    expect(await readOwnedSneakerCount()).toBe(1)
  })

  it('re-checks a submitted transaction by its receipt instead of sending it again', async () => {
    await enqueueStarterMint()
    await runOutboxJob(server)
    // As if the API died after broadcasting, before it recorded the receipt.
    await setStarterMintStatus('submitted')
    const nonceBeforeRecovery = await readGameServerNonce()

    await runOutboxJob(server)

    expect((await readStarterMint()).status).toBe('confirmed')
    expect(await readGameServerNonce()).toBe(nonceBeforeRecovery)
    expect(await readOwnedSneakerCount()).toBe(1)
  })

  it('broadcasts a saved but never-sent transaction with the hash it was saved with', async () => {
    const savedTransactionHash = await signAndSaveStarterMintWithoutBroadcasting()

    await runOutboxJob(server)

    const chainTransaction = await readStarterMint()
    expect(chainTransaction).toMatchObject({
      status: 'confirmed',
      transactionHash: savedTransactionHash,
    })
    expect(await readOwnedSneakerCount()).toBe(1)
  })

  it('signs again when another transaction used the saved nonce, and still mints once', async () => {
    const savedTransactionHash = await signAndSaveStarterMintWithoutBroadcasting()
    // Someone else sends with the game-server key (a manual `cast send`), taking that nonce.
    await waitForMined(
      await server.chain.gameServerWalletClient.sendTransaction({
        to: server.chain.gameServerWalletClient.account.address,
        value: 0n,
      }),
    )

    await runOutboxJob(server)

    const chainTransaction = await readStarterMint()
    expect(chainTransaction.status).toBe('confirmed')
    expect(chainTransaction.transactionHash).not.toBe(savedTransactionHash)
    expect(await readOwnedSneakerCount()).toBe(1)
  })

  it('records a simulated revert as failed with its reason, and spends no gas on it', async () => {
    await mintStarterSneakerOutsideTheOutbox()
    await enqueueStarterMint()
    const nonceBeforeRun = await readGameServerNonce()

    await runOutboxJob(server)

    const chainTransaction = await readStarterMint()
    expect(chainTransaction.status).toBe('failed')
    expect(chainTransaction.lastError).toContain('StarterSneakerAlreadyClaimed')
    expect(await readGameServerNonce()).toBe(nonceBeforeRun)
  })

  it('fails, without minting twice, a transaction whose call began to revert while it was queued', async () => {
    await enqueueStarterMint()
    // Sent but not mined yet: depending on timing, this run's simulation or gas estimation reverts.
    await server.chain.gameServerWalletClient.writeContract({
      address: contractAddresses.sneakerGame,
      abi: sneakerGameAbi,
      functionName: 'mintStarterSneaker',
      args: [playerAccount.address],
    })
    await runOutboxJob(server)
    await waitForGameServerTransactionsToBeMined()

    await runOutboxJob(server)

    const chainTransaction = await readStarterMint()
    expect(chainTransaction.status).toBe('failed')
    expect(chainTransaction.lastError).toContain('StarterSneakerAlreadyClaimed')
    expect(await readOwnedSneakerCount()).toBe(1)
  })

  it('sends a record once even when two runs race without the lease guarding them', async () => {
    await enqueueStarterMint()

    await Promise.all([runOutboxJob(server), runOutboxJob(server)])
    await runOutboxJob(server)

    expect((await readStarterMint()).status).toBe('confirmed')
    expect(await readOwnedSneakerCount()).toBe(1)
  })

  it('does nothing without the job lease', async () => {
    await enqueueStarterMint()

    await runOutboxJob(server, { holdsLease: false })

    expect((await readStarterMint()).status).toBe('queued')
    expect(await readOwnedSneakerCount()).toBe(0)
  })

  it('keeps a transaction queued, with the error, while the chain is unreachable', async () => {
    const offlineServer = await buildTestServer({ contractAddresses })
    try {
      await enqueueChainTransaction(offlineServer.mongo.database, {
        kind: 'mintStarterSneaker',
        idempotencyKey: buildStarterSneakerIdempotencyKey(playerAccount.address),
        payload: { walletAddress: playerAccount.address.toLowerCase() },
        now: new Date(),
      })

      await runOutboxJob(offlineServer)

      const chainTransaction = await findChainTransactionByIdempotencyKey(
        offlineServer.mongo.database,
        buildStarterSneakerIdempotencyKey(playerAccount.address),
      )
      expect(chainTransaction?.status).toBe('queued')
      expect(chainTransaction?.lastError).not.toBeNull()
    } finally {
      await offlineServer.close()
    }
  })
})

function enqueueStarterMint(): Promise<ChainTransactionDocument> {
  return enqueueChainTransaction(server.mongo.database, {
    kind: 'mintStarterSneaker',
    idempotencyKey: buildStarterSneakerIdempotencyKey(playerAccount.address),
    payload: { walletAddress: playerAccount.address.toLowerCase() },
    now: new Date(),
  })
}

async function readStarterMint(): Promise<ChainTransactionDocument> {
  const chainTransaction = await findChainTransactionByIdempotencyKey(
    server.mongo.database,
    buildStarterSneakerIdempotencyKey(playerAccount.address),
  )
  if (chainTransaction === null) throw new Error('The starter mint was never enqueued')
  return chainTransaction
}

async function setStarterMintStatus(status: ChainTransactionDocument['status']): Promise<void> {
  await getChainTransactionsCollection(server.mongo.database).updateOne(
    { idempotencyKey: buildStarterSneakerIdempotencyKey(playerAccount.address) },
    { $set: { status } },
  )
}

/** The state a crash right after the D-019 save leaves behind: saved, never broadcast. */
async function signAndSaveStarterMintWithoutBroadcasting(): Promise<Hash> {
  const chainTransaction = await enqueueStarterMint()
  const signingResult = await simulateAndSignChainTransaction(
    server.chain,
    buildChainTransactionCall(chainTransaction, contractAddresses),
  )
  if (signingResult.outcome !== 'signed') throw new Error('The starter mint would revert')
  await markChainTransactionSubmitted(server.mongo.database, {
    chainTransactionId: chainTransaction._id,
    ...signingResult.signedChainTransaction,
    now: new Date(),
  })
  return signingResult.signedChainTransaction.transactionHash
}

async function mintStarterSneakerOutsideTheOutbox(): Promise<void> {
  await waitForMined(
    await server.chain.gameServerWalletClient.writeContract({
      address: contractAddresses.sneakerGame,
      abi: sneakerGameAbi,
      functionName: 'mintStarterSneaker',
      args: [playerAccount.address],
    }),
  )
}

async function waitForMined(transactionHash: Hash): Promise<void> {
  await server.chain.publicClient.waitForTransactionReceipt({ hash: transactionHash })
}

/** This Anvil answers with the hash before it mines the block. */
async function waitForGameServerTransactionsToBeMined(): Promise<void> {
  const { publicClient, gameServerWalletClient } = server.chain
  const address = gameServerWalletClient.account.address
  const pendingNonce = await publicClient.getTransactionCount({ address, blockTag: 'pending' })
  while ((await publicClient.getTransactionCount({ address, blockTag: 'latest' })) < pendingNonce) {
    await Bun.sleep(50)
  }
}

function readGameServerNonce(): Promise<number> {
  return server.chain.publicClient.getTransactionCount({
    address: server.chain.gameServerWalletClient.account.address,
  })
}

async function readOwnedSneakerCount(): Promise<number> {
  const sneakerTokenIds = await listSneakerTokenIdsOwnedBy(
    { publicClient: server.chain.publicClient, contractAddresses },
    playerAccount.address,
  )
  return sneakerTokenIds.length
}
