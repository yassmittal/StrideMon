import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import type { FastifyInstance } from 'fastify'
import { buildTestServer } from '../test-support/build-test-server'
import {
  enqueueChainTransaction,
  getChainTransactionsCollection,
} from './chain-transactions-repository'

const WALLET_ADDRESS = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
const IDEMPOTENCY_KEY = `mintStarterSneaker:${WALLET_ADDRESS}`

let server: FastifyInstance

beforeEach(async () => {
  server = await buildTestServer()
})

afterEach(async () => {
  await server.close()
})

describe('enqueueChainTransaction', () => {
  it('queues a new transaction with nothing signed yet', async () => {
    const chainTransaction = await enqueueMint()

    expect(chainTransaction).toMatchObject({
      kind: 'mintStarterSneaker',
      status: 'queued',
      transactionHash: null,
      senderNonce: null,
      signedTransaction: null,
      attemptCount: 0,
    })
  })

  it('returns the existing transaction when the same key is enqueued again', async () => {
    const firstEnqueue = await enqueueMint()

    const secondEnqueue = await enqueueMint()

    expect(secondEnqueue._id.equals(firstEnqueue._id)).toBe(true)
  })

  it('creates one transaction when requests with the same key race', async () => {
    const racingEnqueues = await Promise.all(Array.from({ length: 5 }, () => enqueueMint()))

    const storedCount = await getChainTransactionsCollection(server.mongo.database).countDocuments()
    expect(storedCount).toBe(1)
    const firstId = racingEnqueues[0]?._id
    expect(racingEnqueues.every((chainTransaction) => firstId?.equals(chainTransaction._id))).toBe(
      true,
    )
  })
})

function enqueueMint() {
  return enqueueChainTransaction(server.mongo.database, {
    kind: 'mintStarterSneaker',
    idempotencyKey: IDEMPOTENCY_KEY,
    payload: { walletAddress: WALLET_ADDRESS },
    now: new Date(),
  })
}
