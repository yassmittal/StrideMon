import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import { type StrideMonContractAddresses, sneakerGameAbi } from '@stridemon/chain'
import {
  type ActivitySession,
  activitySessionResponseSchema,
  apiErrorResponseSchema,
  type LocationSample,
  uploadLocationSamplesResponseSchema,
} from '@stridemon/shared/api-contracts'
import type { ApiErrorCode } from '@stridemon/shared/domain'
import { FIXTURE_GAME_CONFIG } from '@stridemon/shared/game-rules/fixtures'
import type { FastifyInstance, LightMyRequestResponse } from 'fastify'
import { ObjectId } from 'mongodb'
import {
  createTestClient,
  createWalletClient,
  type Hash,
  http,
  keccak256,
  type PublicClient,
  toHex,
} from 'viem'
import { generatePrivateKey, type PrivateKeyAccount, privateKeyToAccount } from 'viem/accounts'
import type { ValidationSample } from '../../lib/activity-validation/validation-sample'
import { getActivitySessionsCollection } from '../../repositories/activity-sessions-repository'
import { getLocationSamplesCollection } from '../../repositories/location-samples-repository'
import { buildWalkingTrace } from '../../test-support/build-synthetic-trace'
import { buildTestServer } from '../../test-support/build-test-server'
import {
  ANVIL_DEPLOYER_PRIVATE_KEY,
  deployTestContracts,
} from '../../test-support/deploy-test-contracts'
import { giveTestPlayerSneaker } from '../../test-support/give-test-player-sneaker'
import { signInTestPlayer } from '../../test-support/sign-in-test-player'
import { startTestChain, type TestChain } from '../../test-support/start-test-chain'

// A walk that has to end before "now", so the server's clock sees it as the past.
const WALK_DURATION_SECONDS = 600
const WALK_BACKDATE_MILLISECONDS = (WALK_DURATION_SECONDS + 30) * 1000
// The largest durability loss a uint16 allows: 6.5535 points per minute.
// Deploys its own contracts and settles twice: past bun's 5 s default. A timed-out test
// also gets its spawned processes killed, which would take the shared Anvil down with it.
const WORN_OUT_SNEAKER_TEST_TIMEOUT_MILLISECONDS = 30_000
const MAXIMUM_DURABILITY_LOSS_PER_MINUTE_BASIS_POINTS = 65_535

let testChain: TestChain
let contractAddresses: StrideMonContractAddresses
let server: FastifyInstance
let playerAccount: PrivateKeyAccount
let accessToken: string
let sneakerTokenId: bigint

beforeAll(async () => {
  testChain = await startTestChain()
  contractAddresses = await deployTestContracts(testChain.rpcUrl)
})

afterAll(() => {
  testChain.stop()
})

beforeEach(async () => {
  await startServerWithPlayer(contractAddresses)
})

afterEach(async () => {
  await server.close()
})

describe('POST /v1/activity-sessions', () => {
  it('starts an active session with the energy the chain reports', async () => {
    const response = await requestStart()

    expect(response.statusCode).toBe(201)
    expect(activitySessionResponseSchema.parse(response.json()).activitySession).toMatchObject({
      sneakerTokenId: sneakerTokenId.toString(),
      status: 'active',
      finishedAt: null,
      energyAtStart: 10,
      validationResult: null,
      rejectionReason: null,
    })
  })

  it('stores keccak256 of the session id as the on-chain session id', async () => {
    const activitySession = await startActivitySession()

    const activitySessionDocument = await getActivitySessionsCollection(
      server.mongo.database,
    ).findOne({ _id: new ObjectId(activitySession.activitySessionId) })

    expect(activitySessionDocument?.onChainSessionId).toBe(
      keccak256(`0x${activitySession.activitySessionId}`),
    )
  })

  it('refuses a Sneaker that belongs to another wallet (SNEAKER_NOT_OWNED)', async () => {
    const otherPlayerAccount = privateKeyToAccount(generatePrivateKey())
    const otherPlayerSneakerTokenId = await giveTestPlayerSneaker(server, {
      accessToken: (await signInTestPlayer(server, otherPlayerAccount)).accessToken,
      walletAddress: otherPlayerAccount.address,
    })

    const response = await requestStart(otherPlayerSneakerTokenId)

    expectApiError(response, 403, 'SNEAKER_NOT_OWNED')
  })

  it('refuses a Sneaker with no energy left (SNEAKER_OUT_OF_ENERGY)', async () => {
    await settleOnChain({ activeMinutes: 10 })

    const response = await requestStart()

    expectApiError(response, 409, 'SNEAKER_OUT_OF_ENERGY')
  })

  it(
    'refuses a worn-out Sneaker (SNEAKER_NEEDS_REPAIR)',
    async () => {
      // Its own contracts: this test changes the game config.
      const wornOutContractAddresses = await deployTestContracts(testChain.rpcUrl)
      await server.close()
      await startServerWithPlayer(wornOutContractAddresses)
      await setGameConfig(wornOutContractAddresses, {
        ...FIXTURE_GAME_CONFIG,
        durabilityLossPerMinuteBasisPoints: MAXIMUM_DURABILITY_LOSS_PER_MINUTE_BASIS_POINTS,
        energyRegenerationSeconds: 1,
      })
      // 10 minutes wear 66 points: two settlements take durability from 100 to 0.
      await settleOnChain({ activeMinutes: 10 }, wornOutContractAddresses)
      await advanceChainTime(30)
      await settleOnChain({ activeMinutes: 10 }, wornOutContractAddresses)
      await advanceChainTime(30)

      const response = await requestStart()

      expectApiError(response, 409, 'SNEAKER_NEEDS_REPAIR')
    },
    WORN_OUT_SNEAKER_TEST_TIMEOUT_MILLISECONDS,
  )

  it('refuses a second session while one is active, and names the active one', async () => {
    const activitySession = await startActivitySession()

    const response = await requestStart()

    expectApiError(response, 409, 'ACTIVITY_SESSION_ALREADY_ACTIVE')
    expect(apiErrorResponseSchema.parse(response.json()).error.details).toEqual({
      activitySessionId: activitySession.activitySessionId,
    })
  })

  it('lets exactly one of two simultaneous starts through (the database index decides)', async () => {
    const responses = await Promise.all([requestStart(), requestStart()])

    expect(responses.map((response) => response.statusCode).sort()).toEqual([201, 409])
    const activeSessionCount = await getActivitySessionsCollection(
      server.mongo.database,
    ).countDocuments({ status: 'active' })
    expect(activeSessionCount).toBe(1)
  })

  it('allows a new session once the previous one has finished', async () => {
    const activitySession = await startActivitySession()
    await requestFinish(activitySession.activitySessionId)

    const response = await requestStart()

    expect(response.statusCode).toBe(201)
  })

  it('rejects a token id that isn’t a decimal string (VALIDATION_FAILED)', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/v1/activity-sessions',
      headers: authorizationHeader(),
      payload: { sneakerTokenId: '0x01' },
    })

    expectApiError(response, 400, 'VALIDATION_FAILED')
  })

  it('requires an access token', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/v1/activity-sessions',
      payload: { sneakerTokenId: sneakerTokenId.toString() },
    })

    expectApiError(response, 401, 'UNAUTHENTICATED')
  })
})

describe('POST /v1/activity-sessions/:activitySessionId/location-samples', () => {
  it('stores a batch and reports how many samples were new', async () => {
    const activitySession = await startActivitySession()
    const samples = buildUploadSamples(new Date(activitySession.startedAt), 60)

    const response = await requestUpload(activitySession.activitySessionId, samples)

    expect(response.statusCode).toBe(200)
    expect(uploadLocationSamplesResponseSchema.parse(response.json())).toEqual({
      newSampleCount: samples.length,
      duplicateSampleCount: 0,
    })
  })

  it('treats a re-sent batch as a no-op', async () => {
    const activitySession = await startActivitySession()
    const samples = buildUploadSamples(new Date(activitySession.startedAt), 60)
    await requestUpload(activitySession.activitySessionId, samples)

    const response = await requestUpload(activitySession.activitySessionId, samples)

    expect(uploadLocationSamplesResponseSchema.parse(response.json())).toEqual({
      newSampleCount: 0,
      duplicateSampleCount: samples.length,
    })
    const storedSampleCount = await getLocationSamplesCollection(
      server.mongo.database,
    ).countDocuments({ activitySessionId: new ObjectId(activitySession.activitySessionId) })
    expect(storedSampleCount).toBe(samples.length)
  })

  it('stores the new samples of a batch that overlaps an earlier one', async () => {
    const activitySession = await startActivitySession()
    const samples = buildUploadSamples(new Date(activitySession.startedAt), 60)
    await requestUpload(activitySession.activitySessionId, samples.slice(0, 10))

    const response = await requestUpload(activitySession.activitySessionId, samples.slice(5))

    expect(uploadLocationSamplesResponseSchema.parse(response.json())).toEqual({
      newSampleCount: samples.length - 10,
      duplicateSampleCount: 5,
    })
  })

  it('refuses more than 500 samples in one request (VALIDATION_FAILED)', async () => {
    const activitySession = await startActivitySession()
    const samples = buildUploadSamples(new Date(activitySession.startedAt), 1_503)
    expect(samples.length).toBeGreaterThan(500)

    const response = await requestUpload(activitySession.activitySessionId, samples)

    expectApiError(response, 400, 'VALIDATION_FAILED')
  })

  it('refuses samples for a session that has finished (ACTIVITY_SESSION_NOT_ACTIVE)', async () => {
    const activitySession = await startActivitySession()
    await requestFinish(activitySession.activitySessionId)

    const response = await requestUpload(
      activitySession.activitySessionId,
      buildUploadSamples(new Date(activitySession.startedAt), 30),
    )

    expectApiError(response, 409, 'ACTIVITY_SESSION_NOT_ACTIVE')
  })

  it('answers 404 for another player’s session, so ids can’t be probed', async () => {
    const activitySession = await startActivitySession()
    const otherPlayerAccessToken = (
      await signInTestPlayer(server, privateKeyToAccount(generatePrivateKey()))
    ).accessToken

    const response = await server.inject({
      method: 'POST',
      url: `/v1/activity-sessions/${activitySession.activitySessionId}/location-samples`,
      headers: { authorization: `Bearer ${otherPlayerAccessToken}` },
      payload: { samples: buildUploadSamples(new Date(activitySession.startedAt), 30) },
    })

    expectApiError(response, 404, 'NOT_FOUND')
  })
})

describe('POST /v1/activity-sessions/:activitySessionId/finish', () => {
  it('validates a 10-minute walk as 10 active minutes and moves on to settling', async () => {
    const activitySession = await startBackdatedWalk()

    const finishedActivitySession = await finishActivitySession(activitySession.activitySessionId)

    expect(finishedActivitySession.status).toBe('settling')
    expect(finishedActivitySession.finishedAt).not.toBeNull()
    expect(finishedActivitySession.validationResult).toMatchObject({
      activeMinutes: 10,
      averageSpeedKilometersPerHour: 5,
      rejectedSampleCount: 0,
      warnings: [],
    })
    expect(finishedActivitySession.rejectionReason).toBeNull()
  })

  it('rejects a walk with a mocked location (MOCK_LOCATION_DETECTED)', async () => {
    const activitySession = await startBackdatedWalk({ hasMockedLocation: true })

    const finishedActivitySession = await finishActivitySession(activitySession.activitySessionId)

    expect(finishedActivitySession).toMatchObject({
      status: 'rejected',
      rejectionReason: 'MOCK_LOCATION_DETECTED',
      validationResult: null,
    })
  })

  it('rejects a session with too few samples (INSUFFICIENT_ACTIVITY_DATA)', async () => {
    const activitySession = await startActivitySession()

    const finishedActivitySession = await finishActivitySession(activitySession.activitySessionId)

    expect(finishedActivitySession).toMatchObject({
      status: 'rejected',
      rejectionReason: 'INSUFFICIENT_ACTIVITY_DATA',
    })
  })

  it('returns the same session when finish is called again', async () => {
    const activitySession = await startBackdatedWalk()
    const firstFinish = await finishActivitySession(activitySession.activitySessionId)

    const secondFinish = await finishActivitySession(activitySession.activitySessionId)

    expect(secondFinish).toEqual(firstFinish)
  })

  it('validates again a session a crash left in validating', async () => {
    const activitySession = await startBackdatedWalk()
    await getActivitySessionsCollection(server.mongo.database).updateOne(
      { _id: new ObjectId(activitySession.activitySessionId) },
      { $set: { status: 'validating', finishedAt: new Date() } },
    )

    const finishedActivitySession = await finishActivitySession(activitySession.activitySessionId)

    expect(finishedActivitySession.status).toBe('settling')
    expect(finishedActivitySession.validationResult?.activeMinutes).toBe(10)
  })

  it('refuses a session the cleanup job abandoned (ACTIVITY_SESSION_NOT_ACTIVE)', async () => {
    const activitySession = await startActivitySession()
    await getActivitySessionsCollection(server.mongo.database).updateOne(
      { _id: new ObjectId(activitySession.activitySessionId) },
      { $set: { status: 'abandoned' } },
    )

    const response = await requestFinish(activitySession.activitySessionId)

    expectApiError(response, 409, 'ACTIVITY_SESSION_NOT_ACTIVE')
  })
})

describe('GET /v1/activity-sessions/:activitySessionId', () => {
  it('returns the player’s session', async () => {
    const activitySession = await startActivitySession()

    const response = await server.inject({
      method: 'GET',
      url: `/v1/activity-sessions/${activitySession.activitySessionId}`,
      headers: authorizationHeader(),
    })

    expect(response.statusCode).toBe(200)
    expect(activitySessionResponseSchema.parse(response.json()).activitySession).toEqual(
      activitySession,
    )
  })

  it('answers 404 for an id that doesn’t exist', async () => {
    const response = await server.inject({
      method: 'GET',
      url: `/v1/activity-sessions/${new ObjectId().toHexString()}`,
      headers: authorizationHeader(),
    })

    expectApiError(response, 404, 'NOT_FOUND')
  })
})

async function startServerWithPlayer(
  serverContractAddresses: StrideMonContractAddresses,
): Promise<void> {
  server = await buildTestServer({
    monadRpcUrl: testChain.rpcUrl,
    contractAddresses: serverContractAddresses,
  })
  playerAccount = privateKeyToAccount(generatePrivateKey())
  accessToken = (await signInTestPlayer(server, playerAccount)).accessToken
  sneakerTokenId = await giveTestPlayerSneaker(server, {
    accessToken,
    walletAddress: playerAccount.address,
  })
}

function authorizationHeader() {
  return { authorization: `Bearer ${accessToken}` }
}

function requestStart(requestedSneakerTokenId = sneakerTokenId) {
  return server.inject({
    method: 'POST',
    url: '/v1/activity-sessions',
    headers: authorizationHeader(),
    payload: { sneakerTokenId: requestedSneakerTokenId.toString() },
  })
}

async function startActivitySession(): Promise<ActivitySession> {
  const response = await requestStart()
  expect(response.statusCode).toBe(201)
  return activitySessionResponseSchema.parse(response.json()).activitySession
}

function requestUpload(activitySessionId: string, samples: LocationSample[]) {
  return server.inject({
    method: 'POST',
    url: `/v1/activity-sessions/${activitySessionId}/location-samples`,
    headers: authorizationHeader(),
    payload: { samples },
  })
}

function requestFinish(activitySessionId: string) {
  return server.inject({
    method: 'POST',
    url: `/v1/activity-sessions/${activitySessionId}/finish`,
    headers: authorizationHeader(),
  })
}

async function finishActivitySession(activitySessionId: string): Promise<ActivitySession> {
  const response = await requestFinish(activitySessionId)
  expect(response.statusCode).toBe(200)
  return activitySessionResponseSchema.parse(response.json()).activitySession
}

/**
 * A session whose start is moved back far enough that a whole 10-minute walk at
 * 5 km/h fits before now, with every sample of it uploaded.
 */
async function startBackdatedWalk({
  hasMockedLocation = false,
}: {
  hasMockedLocation?: boolean
} = {}): Promise<ActivitySession> {
  const activitySession = await startActivitySession()
  const backdatedStartedAt = new Date(Date.now() - WALK_BACKDATE_MILLISECONDS)
  await getActivitySessionsCollection(server.mongo.database).updateOne(
    { _id: new ObjectId(activitySession.activitySessionId) },
    { $set: { startedAt: backdatedStartedAt } },
  )
  const samples = buildUploadSamples(backdatedStartedAt, WALK_DURATION_SECONDS).map(
    (sample, sampleIndex) =>
      sampleIndex === 50 ? { ...sample, isMockedLocation: hasMockedLocation } : sample,
  )
  const uploadResponse = await requestUpload(activitySession.activitySessionId, samples)
  expect(uploadResponse.statusCode).toBe(200)
  return activitySession
}

function buildUploadSamples(startedAt: Date, durationSeconds: number): LocationSample[] {
  return buildWalkingTrace({ durationSeconds, speedKilometersPerHour: 5, startedAt }).map(
    toUploadSample,
  )
}

function toUploadSample(sample: ValidationSample): LocationSample {
  return {
    sequenceNumber: sample.sequenceNumber,
    recordedAt: sample.recordedAt.toISOString(),
    latitude: sample.latitude,
    longitude: sample.longitude,
    accuracyMeters: sample.accuracyMeters,
    speedMetersPerSecond: null,
    isMockedLocation: sample.isMockedLocation,
  }
}

function expectApiError(
  response: LightMyRequestResponse,
  statusCode: number,
  errorCode: ApiErrorCode,
): void {
  expect(response.statusCode).toBe(statusCode)
  expect(apiErrorResponseSchema.parse(response.json()).error.code).toBe(errorCode)
}

/** Spends the test player's energy the way Phase 5 will: the game server settles a session. */
async function settleOnChain(
  { activeMinutes }: { activeMinutes: number },
  settlementContractAddresses = contractAddresses,
): Promise<void> {
  const transactionHash = await server.chain.gameServerWalletClient.writeContract({
    address: settlementContractAddresses.sneakerGame,
    abi: sneakerGameAbi,
    functionName: 'settleSession',
    args: [
      {
        sessionId: keccak256(toHex(crypto.randomUUID())),
        tokenId: sneakerTokenId,
        player: playerAccount.address,
        activeMinutes,
        distanceMeters: 0,
      },
    ],
  })
  await waitForSuccessfulReceipt(transactionHash)
}

async function setGameConfig(
  targetContractAddresses: StrideMonContractAddresses,
  gameConfig: typeof FIXTURE_GAME_CONFIG,
): Promise<void> {
  const adminWalletClient = createWalletClient({
    account: privateKeyToAccount(ANVIL_DEPLOYER_PRIVATE_KEY),
    chain: server.config.monadChain,
    transport: http(testChain.rpcUrl),
  })
  const transactionHash = await adminWalletClient.writeContract({
    address: targetContractAddresses.sneakerGame,
    abi: sneakerGameAbi,
    functionName: 'setGameConfig',
    args: [gameConfig],
  })
  await waitForSuccessfulReceipt(transactionHash)
}

async function advanceChainTime(seconds: number): Promise<void> {
  const testClient = createTestClient({
    mode: 'anvil',
    chain: server.config.monadChain,
    transport: http(testChain.rpcUrl),
  })
  await testClient.increaseTime({ seconds })
  await testClient.mine({ blocks: 1 })
}

// This Anvil answers with the hash before it mines the block, so wait for the receipt.
async function waitForSuccessfulReceipt(transactionHash: Hash): Promise<void> {
  const publicClient: PublicClient = server.chain.publicClient
  const receipt = await publicClient.waitForTransactionReceipt({ hash: transactionHash })
  if (receipt.status !== 'success') throw new Error(`Transaction reverted: ${transactionHash}`)
}
