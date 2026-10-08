import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import type { StrideMonContractAddresses } from '@stridemon/chain'
import {
  apiErrorResponseSchema,
  currentUserResponseSchema,
  onboardingStatusResponseSchema,
} from '@stridemon/shared/api-contracts'
import type { FastifyInstance } from 'fastify'
import { generatePrivateKey, type PrivateKeyAccount, privateKeyToAccount } from 'viem/accounts'
import { getChainTransactionsCollection } from '../../repositories/chain-transactions-repository'
import { listSneakerTokenIdsOwnedBy, readSneakerState } from '../../services/sneaker-chain-reader'
import { buildTestServer, TEST_GAS_DRIP_AMOUNT_WEI } from '../../test-support/build-test-server'
import {
  deployTestContracts,
  TEST_CONTRACTS_DEPLOY_TIMEOUT_MILLISECONDS,
} from '../../test-support/deploy-test-contracts'
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
