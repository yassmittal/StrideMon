import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import { foundingPassAbi, type StrideMonContractAddresses } from '@stridemon/chain'
import {
  apiErrorResponseSchema,
  currentUserResponseSchema,
  onboardingStatusResponseSchema,
} from '@stridemon/shared/api-contracts'
import type { ApiErrorCode } from '@stridemon/shared/domain'
import type { FastifyInstance } from 'fastify'
import { generatePrivateKey, type PrivateKeyAccount, privateKeyToAccount } from 'viem/accounts'
import { getChainTransactionsCollection } from '../../repositories/chain-transactions-repository'
import { findFounderSneakerTokenId } from '../../services/founding-pass-chain-reader'
import { listSneakerTokenIdsOwnedBy, readSneakerState } from '../../services/sneaker-chain-reader'
import { buildTestServer, TEST_GAS_DRIP_AMOUNT_WEI } from '../../test-support/build-test-server'
import {
  deployTestContracts,
  TEST_CONTRACTS_DEPLOY_TIMEOUT_MILLISECONDS,
} from '../../test-support/deploy-test-contracts'
import {
  mintFoundingPassOnChain,
  setFoundingPassMintedCountOnChain,
} from '../../test-support/mint-test-founding-pass'
import { runOutboxJob } from '../../test-support/run-outbox-job'
import { signInTestPlayer } from '../../test-support/sign-in-test-player'
import { startTestChain, type TestChain } from '../../test-support/start-test-chain'

let testChain: TestChain
let contractAddresses: StrideMonContractAddresses
let server: FastifyInstance
let playerAccount: PrivateKeyAccount
let accessToken: string

beforeAll(async () => {
  testChain = await startTestChain()
  contractAddresses = await deployTestContracts(testChain.rpcUrl)
}, TEST_CONTRACTS_DEPLOY_TIMEOUT_MILLISECONDS)

afterAll(() => {
  testChain.stop()
})

beforeEach(async () => {
  server = await buildTestServer({ monadRpcUrl: testChain.rpcUrl, contractAddresses })
  playerAccount = privateKeyToAccount(generatePrivateKey())
  accessToken = (await signInTestPlayer(server, playerAccount)).accessToken
})

afterEach(async () => {
  await server.close()
})

describe('GET /v1/onboarding/status', () => {
  it('reports both steps as notStarted before the player asked for anything', async () => {
    const onboardingStatus = await readOnboardingStatus()

    expect(onboardingStatus).toEqual({
      starterSneaker: { status: 'notStarted', transactionHash: null },
      gasDrip: { status: 'notStarted', transactionHash: null },
      starterSneakerKind: 'normal',
      isFoundingPassRequired: false,
    })
  })

  it('requires an access token', async () => {
    const response = await server.inject({ method: 'GET', url: '/v1/onboarding/status' })

    expect(response.statusCode).toBe(401)
    expect(apiErrorResponseSchema.parse(response.json()).error.code).toBe('UNAUTHENTICATED')
  })
})

describe('POST /v1/onboarding/starter-sneaker', () => {
  it('queues the starter mint and the gas drip, and reports both as pending', async () => {
    const onboardingStatus = await requestStarterSneaker()

    expect(onboardingStatus.starterSneaker.status).toBe('pending')
    expect(onboardingStatus.gasDrip.status).toBe('pending')
  })

  it('creates one transaction per step however many times it is called', async () => {
    await requestStarterSneaker()

    await requestStarterSneaker()

    const chainTransactions = await getChainTransactionsCollection(server.mongo.database)
      .find({})
      .toArray()
    expect(chainTransactions.map((chainTransaction) => chainTransaction.kind).sort()).toEqual([
      'mintStarterSneaker',
      'sendGasDrip',
    ])
  })

  it('gives a new wallet a starter Sneaker and a little MON once the outbox runs', async () => {
    await requestStarterSneaker()

    await runOutboxJob(server)

    const onboardingStatus = await readOnboardingStatus()
    expect(onboardingStatus.starterSneaker).toMatchObject({ status: 'confirmed' })
    expect(onboardingStatus.gasDrip).toMatchObject({ status: 'confirmed' })
    expect(await readOwnedSneakerTokenIds()).toHaveLength(1)
    expect(await server.chain.publicClient.getBalance({ address: playerAccount.address })).toBe(
      TEST_GAS_DRIP_AMOUNT_WEI,
    )
  })

  it('mints the Sneaker with the starter stats: level 1, efficiency 10, durability 100, energy 10', async () => {
    await requestStarterSneaker()
    await runOutboxJob(server)
    const [sneakerTokenId] = await readOwnedSneakerTokenIds()
    if (sneakerTokenId === undefined) throw new Error('No Sneaker was minted')

    const sneakerState = await readSneakerState(
      { publicClient: server.chain.publicClient, contractAddresses },
      sneakerTokenId,
    )

    expect(sneakerState).toMatchObject({
      level: 1,
      efficiency: 10,
      durability: 100,
      currentEnergy: 10,
    })
  })

  it('marks the user as onboarded once both transactions are confirmed', async () => {
    await requestStarterSneaker()

    await runOutboxJob(server)

    const meResponse = await server.inject({
      method: 'GET',
      url: '/v1/me',
      headers: { authorization: `Bearer ${accessToken}` },
    })
    expect(currentUserResponseSchema.parse(meResponse.json()).user).toMatchObject({
      hasReceivedStarterSneaker: true,
      hasReceivedGasDrip: true,
    })
  })

  it('never mints a second Sneaker when the player signs in and asks again', async () => {
    await requestStarterSneaker()
    await runOutboxJob(server)
    accessToken = (await signInTestPlayer(server, playerAccount)).accessToken

    const onboardingStatus = await requestStarterSneaker()
    await runOutboxJob(server)

    expect(onboardingStatus.starterSneaker.status).toBe('confirmed')
    expect(await readOwnedSneakerTokenIds()).toHaveLength(1)
  })
})

// The gate on, the way the preview week runs it (D-041).
const GATE_ON_ENVIRONMENT = { EARLY_ACCESS_REQUIRED: 'true' }
const HOUR_MILLISECONDS = 3_600_000
// The test chain is shared by the whole file: every pass gets a design nobody used yet.
let lastUsedDesignNumber = 0

describe('the early-access gate and Founder Sneakers', () => {
  it('refuses a starter Sneaker to a wallet without a pass while the gate is on', async () => {
    await restartServer(GATE_ON_ENVIRONMENT)

    const response = await requestStarterSneakerResponse()

    expect(response.statusCode).toBe(403)
    expect(apiErrorResponseSchema.parse(response.json()).error).toMatchObject({
      code: 'FOUNDING_PASS_REQUIRED' satisfies ApiErrorCode,
      details: { phase: 'openMint' },
    })
    expect(await readOnboardingStatus()).toMatchObject({
      starterSneaker: { status: 'notStarted' },
      isFoundingPassRequired: true,
    })
  })

  it('switches the gate off by itself on the backup opening date', async () => {
    await restartServer({
      ...GATE_ON_ENVIRONMENT,
      PASS_BACKUP_OPENING_AT: new Date(Date.now() - HOUR_MILLISECONDS).toISOString(),
    })

    const onboardingStatus = await requestStarterSneaker()

    expect(onboardingStatus).toMatchObject({
      starterSneaker: { status: 'pending' },
      starterSneakerKind: 'normal',
      isFoundingPassRequired: false,
    })
  })

  it('switches the gate off by itself once all 1,000 are minted', async () => {
    await restartServer(GATE_ON_ENVIRONMENT)
    const mintedCountBefore = await readMintedCount()
    await setFoundingPassMintedCountOnChain(server, 1000)
    try {
      expect(await readMintedCount()).toBe(1000n)

      const onboardingStatus = await requestStarterSneaker()

      expect(onboardingStatus).toMatchObject({ starterSneaker: { status: 'pending' } })
    } finally {
      await setFoundingPassMintedCountOnChain(server, Number(mintedCountBefore))
    }
  })

  it('gives a pass holder its Founder Sneaker and the gas drip, gate or not', async () => {
    await restartServer(GATE_ON_ENVIRONMENT)
    const foundingPassTokenId = await mintPassToPlayer()

    const pendingStatus = await requestStarterSneaker()
    await runOutboxJob(server)

    expect(pendingStatus).toMatchObject({
      starterSneaker: { status: 'pending' },
      starterSneakerKind: 'founder',
      isFoundingPassRequired: false,
    })
    expect(await readOnboardingStatus()).toMatchObject({
      starterSneaker: { status: 'confirmed' },
      gasDrip: { status: 'confirmed' },
    })
    const [sneakerTokenId] = await readOwnedSneakerTokenIds()
    expect(await readFounderSneakerTokenId(foundingPassTokenId)).toBe(sneakerTokenId ?? null)
  })

  it('gives a Founder Sneaker to a holder who already has a normal Sneaker', async () => {
    await requestStarterSneaker()
    await runOutboxJob(server)
    const foundingPassTokenId = await mintPassToPlayer()

    await requestStarterSneaker()
    await runOutboxJob(server)

    const ownedSneakerTokenIds = await readOwnedSneakerTokenIds()
    expect(ownedSneakerTokenIds).toHaveLength(2)
    expect(ownedSneakerTokenIds).toContain(
      (await readFounderSneakerTokenId(foundingPassTokenId)) ?? 0n,
    )
  })

  it('gives one Founder Sneaker per pass however many times it is asked', async () => {
    await mintPassToPlayer()
    await requestStarterSneaker()
    await requestStarterSneaker()
    await runOutboxJob(server)

    const onboardingStatus = await requestStarterSneaker()
    await runOutboxJob(server)

    expect(onboardingStatus.starterSneaker.status).toBe('confirmed')
    expect(await readOwnedSneakerTokenIds()).toHaveLength(1)
    expect(
      await getChainTransactionsCollection(server.mongo.database).countDocuments({
        kind: 'mintFounderSneaker',
      }),
    ).toBe(1)
  })
})

async function restartServer(environmentOverrides: Record<string, string>): Promise<void> {
  await server.close()
  server = await buildTestServer({
    monadRpcUrl: testChain.rpcUrl,
    contractAddresses,
    environmentOverrides,
  })
  accessToken = (await signInTestPlayer(server, playerAccount)).accessToken
}

async function mintPassToPlayer(): Promise<bigint> {
  lastUsedDesignNumber += 1
  await mintFoundingPassOnChain(server, {
    walletAddress: playerAccount.address,
    designNumber: lastUsedDesignNumber,
  })
  return BigInt(lastUsedDesignNumber)
}

function readFounderSneakerTokenId(foundingPassTokenId: bigint) {
  return findFounderSneakerTokenId(
    { publicClient: server.chain.publicClient, contractAddresses },
    foundingPassTokenId,
  )
}

function readMintedCount() {
  return server.chain.publicClient.readContract({
    address: contractAddresses.foundingPass,
    abi: foundingPassAbi,
    functionName: 'mintedCount',
  })
}

function requestStarterSneakerResponse() {
  return server.inject({
    method: 'POST',
    url: '/v1/onboarding/starter-sneaker',
    headers: { authorization: `Bearer ${accessToken}` },
  })
}

async function requestStarterSneaker() {
  const response = await server.inject({
    method: 'POST',
    url: '/v1/onboarding/starter-sneaker',
    headers: { authorization: `Bearer ${accessToken}` },
  })
  expect(response.statusCode).toBe(200)
  return onboardingStatusResponseSchema.parse(response.json())
}

async function readOnboardingStatus() {
  const response = await server.inject({
    method: 'GET',
    url: '/v1/onboarding/status',
    headers: { authorization: `Bearer ${accessToken}` },
  })
  expect(response.statusCode).toBe(200)
  return onboardingStatusResponseSchema.parse(response.json())
}

function readOwnedSneakerTokenIds() {
  return listSneakerTokenIdsOwnedBy(
    { publicClient: server.chain.publicClient, contractAddresses },
    playerAccount.address,
  )
}
