import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import type { FastifyInstance } from 'fastify'
import { ObjectId } from 'mongodb'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { buildTestServer } from '../../test-support/build-test-server'
import { signInTestPlayer } from '../../test-support/sign-in-test-player'
import { startTestChain, type TestChain } from '../../test-support/start-test-chain'

let testChain: TestChain
let server: FastifyInstance

beforeAll(async () => {
  testChain = await startTestChain()
})

afterAll(() => {
  testChain.stop()
})

beforeEach(async () => {
  server = await buildTestServer({ monadRpcUrl: testChain.rpcUrl })
})

afterEach(async () => {
  await server.close()
})

describe('DELETE /v1/me', () => {
  it('deletes the player’s off-chain data, keeps the outbox, and leaves other players alone', async () => {
    const database = server.mongo.database
    const playerAccount = privateKeyToAccount(generatePrivateKey())
    const otherPlayerAccount = privateKeyToAccount(generatePrivateKey())
    const { accessToken } = await signInTestPlayer(server, playerAccount)
    await signInTestPlayer(server, otherPlayerAccount)
    const walletAddress = playerAccount.address.toLowerCase()
    const user = await database.collection('users').findOne({ walletAddress })
    const otherUser = await database
      .collection('users')
      .findOne({ walletAddress: otherPlayerAccount.address.toLowerCase() })
    if (user === null || otherUser === null) throw new Error('Sign-in created no user')

    // Only the fields deletion matches on.
    const activitySessionId = new ObjectId()
    const otherActivitySessionId = new ObjectId()
    await database.collection('activitySessions').insertMany([
      { _id: activitySessionId, userId: user._id, walletAddress },
      { _id: otherActivitySessionId, userId: otherUser._id },
    ])
    await database.collection('locationSamples').insertMany([
      { activitySessionId, sequenceNumber: 0 },
      { activitySessionId: otherActivitySessionId, sequenceNumber: 0 },
    ])
    await database
      .collection('chainTransactions')
      .insertOne({ idempotencyKey: `mintStarterSneaker:${walletAddress}` })

    const response = await server.inject({
      method: 'DELETE',
      url: '/v1/me',
      headers: { authorization: `Bearer ${accessToken}` },
    })

    expect(response.statusCode).toBe(204)
    expect(await database.collection('users').countDocuments({ _id: user._id })).toBe(0)
    expect(await database.collection('authSessions').countDocuments({ userId: user._id })).toBe(0)
    expect(await database.collection('activitySessions').countDocuments({ userId: user._id })).toBe(
      0,
    )
    expect(await database.collection('locationSamples').countDocuments({ activitySessionId })).toBe(
      0,
    )
    expect(await database.collection('chainTransactions').countDocuments({})).toBe(1)
    expect(await database.collection('users').countDocuments({ _id: otherUser._id })).toBe(1)
    expect(
      await database
        .collection('locationSamples')
        .countDocuments({ activitySessionId: otherActivitySessionId }),
    ).toBe(1)

    // The access token is still valid until it expires, but the user it names is gone.
    const currentUserResponse = await server.inject({
      method: 'GET',
      url: '/v1/me',
      headers: { authorization: `Bearer ${accessToken}` },
    })
    expect(currentUserResponse.statusCode).toBe(401)
  })

  it('requires an access token', async () => {
    const response = await server.inject({ method: 'DELETE', url: '/v1/me' })

    expect(response.statusCode).toBe(401)
  })
})
