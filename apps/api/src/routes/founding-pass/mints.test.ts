import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test'
import { foundingPassAbi, type StrideMonContractAddresses } from '@stridemon/chain'
import {
  apiErrorResponseSchema,
  type FoundingPassMint,
  foundingPassCollectionResponseSchema,
  foundingPassMintResponseSchema,
} from '@stridemon/shared/api-contracts'
import type { ApiErrorCode } from '@stridemon/shared/domain'
import type { FastifyInstance, LightMyRequestResponse } from 'fastify'
import { generatePrivateKey, type PrivateKeyAccount, privateKeyToAccount } from 'viem/accounts'
import { insertWaitlistSignupIfNew } from '../../repositories/waitlist-signups-repository'
import {
  buildTestServer,
  TEST_PASS_SCHEDULE_VARIABLES,
  TEST_WAITLIST_ALLOWED_ORIGIN,
} from '../../test-support/build-test-server'
import {
  deployTestContracts,
  TEST_CONTRACTS_DEPLOY_TIMEOUT_MILLISECONDS,
} from '../../test-support/deploy-test-contracts'
import { buildTestRemoteAddress, TEST_TURNSTILE_TOKEN } from '../../test-support/fake-pass-services'
import {
  mintFoundingPassOnChain,
  signTestEmailProof,
} from '../../test-support/mint-test-founding-pass'
import { runOutboxJob } from '../../test-support/run-outbox-job'
import { signInTestPlayer } from '../../test-support/sign-in-test-player'
import { startTestChain, type TestChain } from '../../test-support/start-test-chain'

const HOUR_MILLISECONDS = 3_600_000

let testChain: TestChain
let contractAddresses: StrideMonContractAddresses
let server: FastifyInstance
// The test chain is shared by the whole file, so every test mints designs nobody used yet.
let lastUsedDesignNumber = 0

beforeAll(async () => {
  testChain = await startTestChain()
  contractAddresses = await deployTestContracts(testChain.rpcUrl)
}, TEST_CONTRACTS_DEPLOY_TIMEOUT_MILLISECONDS)

afterAll(() => {
  testChain.stop()
})

afterEach(async () => {
  await server.close()
})

type TestPlayer = { playerAccount: PrivateKeyAccount; accessToken: string; email: string }

describe('POST /v1/pass/mints', () => {
  it('mints the pass through the outbox, and the mint reveals its founder number', async () => {
    await startServer()
    const player = await signInNewPlayer()
    const designNumber = takeDesignNumber()

    const queuedMint = expectMint(await requestMint(player, designNumber), 201)
    await runOutboxJob(server)
    const confirmedMint = await readMint(player, queuedMint.mintId)

    expect(queuedMint).toMatchObject({ designNumber, status: 'queued', founderNumber: null })
    expect(confirmedMint).toMatchObject({ designNumber, status: 'confirmed', founderNumber: 1 })
    expect(typeof confirmedMint.hasGoldFrame).toBe('boolean')
    expect(confirmedMint.transactionHash).toMatch(/^0x[0-9a-f]{64}$/)
    expect(await readPassOwner(designNumber)).toBe(player.playerAccount.address)
  })

  it('answers a repeated request with the same mint (a double tap)', async () => {
    await startServer()
    const player = await signInNewPlayer()
    const designNumber = takeDesignNumber()

    const [firstResponse, secondResponse] = await Promise.all([
      requestMint(player, designNumber),
      requestMint(player, designNumber),
    ])

    const mints = [firstResponse, secondResponse].map((response) =>
      foundingPassMintResponseSchema.parse(response.json()),
    )
    expect([firstResponse.statusCode, secondResponse.statusCode].sort()).toEqual([200, 201])
    expect(mints[0]?.mint.mintId).toBe(mints[1]?.mint.mintId ?? '')
  })

  it('lets one of two racing players take a design, and offers the other 3 similar ones', async () => {
    await startServer()
    const [firstPlayer, secondPlayer] = [await signInNewPlayer(), await signInNewPlayer()]
    const designNumber = takeDesignNumber()

    const responses = await Promise.all([
      requestMint(firstPlayer, designNumber),
      requestMint(secondPlayer, designNumber),
    ])

    expect(responses.map((response) => response.statusCode).sort()).toEqual([201, 409])
    const losingResponse = responses.find((response) => response.statusCode === 409)
    if (losingResponse === undefined) throw new Error('No racing request lost')
    const { details } = expectApiError(losingResponse, 409, 'PASS_ALREADY_MINTED').error
    expect(details?.similarAvailableDesignNumbers).toHaveLength(3)
    expect(details?.similarAvailableDesignNumbers).not.toContain(designNumber)
  })

  it('refuses a design minted on-chain outside the API (PASS_ALREADY_MINTED)', async () => {
    await startServer()
    const designNumber = takeDesignNumber()
    await mintFoundingPassOnChain(server, {
      walletAddress: privateKeyToAccount(generatePrivateKey()).address,
      designNumber,
    })

    const response = await requestMint(await signInNewPlayer(), designNumber)

    expectApiError(response, 409, 'PASS_ALREADY_MINTED')
  })

  it('gives one pass per email (PASS_EMAIL_ALREADY_USED)', async () => {
    await startServer()
    const firstPlayer = await signInNewPlayer()
    const designNumber = takeDesignNumber()
    expectMint(await requestMint(firstPlayer, designNumber), 201)
    const secondPlayer = { ...(await signInNewPlayer()), email: firstPlayer.email }

    const response = await requestMint(secondPlayer, takeDesignNumber())

    expect(expectApiError(response, 409, 'PASS_EMAIL_ALREADY_USED').error.details).toEqual({
      designNumber,
    })
  })

  it('gives one pass per wallet (PASS_WALLET_ALREADY_USED), by our mints and by the chain', async () => {
    await startServer()
    const player = await signInNewPlayer()
    const designNumber = takeDesignNumber()
    const firstMint = expectMint(await requestMint(player, designNumber), 201)
    const holder = await signInNewPlayer()
    const heldDesignNumber = takeDesignNumber()
    await mintFoundingPassOnChain(server, {
      walletAddress: holder.playerAccount.address,
      designNumber: heldDesignNumber,
    })

    const secondMintResponse = await requestMint(
      { ...player, email: 'another@example.com' },
      takeDesignNumber(),
    )
    const holderResponse = await requestMint(holder, takeDesignNumber())

    expect(
      expectApiError(secondMintResponse, 409, 'PASS_WALLET_ALREADY_USED').error.details,
    ).toEqual({
      designNumber,
      mintId: firstMint.mintId,
    })
    expect(expectApiError(holderResponse, 409, 'PASS_WALLET_ALREADY_USED').error.details).toEqual({
      designNumber: heldDesignNumber,
      mintId: null,
    })
  })

  it('fails a mint the chain refuses, and frees its design, email and wallet', async () => {
    await startServer()
    const player = await signInNewPlayer()
    const designNumber = takeDesignNumber()
    const refusedMint = expectMint(await requestMint(player, designNumber), 201)
    // Someone else gets it on-chain before the outbox sends ours.
    await mintFoundingPassOnChain(server, {
      walletAddress: privateKeyToAccount(generatePrivateKey()).address,
      designNumber,
    })

    await runOutboxJob(server)

    expect(await readMint(player, refusedMint.mintId)).toMatchObject({
      status: 'failed',
      failureCode: 'PASS_ALREADY_MINTED',
    })
    expectMint(await requestMint(player, takeDesignNumber()), 201)
  })

  it('refuses a mint without a working robot check or email proof', async () => {
    await startServer()
    const player = await signInNewPlayer()

    const botResponse = await requestMint(player, takeDesignNumber(), { turnstileToken: 'bot' })
    const forgedProofResponse = await requestMint(player, takeDesignNumber(), {
      emailProof: 'not-a-proof',
    })

    expectApiError(botResponse, 403, 'TURNSTILE_FAILED')
    expectApiError(forgedProofResponse, 401, 'EMAIL_PROOF_INVALID')
  })

  it('requires the website sign-in', async () => {
    await startServer()

    const response = await server.inject({
      method: 'POST',
      url: '/v1/pass/mints',
      payload: { designNumber: 1, emailProof: 'x', turnstileToken: TEST_TURNSTILE_TOKEN },
      remoteAddress: buildTestRemoteAddress(),
    })

    expectApiError(response, 401, 'UNAUTHENTICATED')
  })
})

describe('the schedule', () => {
  it('refuses to mint before the waitlist window, naming when it opens (PASS_MINT_NOT_OPEN)', async () => {
    const opensAt = new Date(Date.now() + 24 * HOUR_MILLISECONDS)
    await startServer({ PASS_WAITLIST_WINDOW_STARTS_AT: opensAt.toISOString() })

    const response = await requestMint(await signInNewPlayer(), takeDesignNumber())

    expect(expectApiError(response, 409, 'PASS_MINT_NOT_OPEN').error.details).toEqual({
      opensAt: opensAt.toISOString(),
    })
    expect((await readCollection()).schedule).toMatchObject({
      phase: 'preview',
      nextPhaseAt: opensAt.toISOString(),
    })
  })

  it('lets only emails that joined the waitlist before the window mint in it', async () => {
    const windowStartsAt = new Date(Date.now() - HOUR_MILLISECONDS)
    await startServer({ PASS_WAITLIST_WINDOW_STARTS_AT: windowStartsAt.toISOString() })
    const [joinedBefore, joinedAfter, neverJoined] = [
      await signInNewPlayer(),
      await signInNewPlayer(),
      await signInNewPlayer(),
    ]
    await joinWaitlist(joinedBefore.email, new Date(windowStartsAt.getTime() - HOUR_MILLISECONDS))
    await joinWaitlist(joinedAfter.email, new Date())

    const joinedBeforeResponse = await requestMint(joinedBefore, takeDesignNumber())
    const joinedAfterResponse = await requestMint(joinedAfter, takeDesignNumber())
    const neverJoinedResponse = await requestMint(neverJoined, takeDesignNumber())

    expectMint(joinedBeforeResponse, 201)
    const openMintStartsAt = new Date(windowStartsAt.getTime() + 48 * HOUR_MILLISECONDS)
    for (const refusedResponse of [joinedAfterResponse, neverJoinedResponse]) {
      expect(
        expectApiError(refusedResponse, 403, 'PASS_WAITLIST_WINDOW_ONLY').error.details,
      ).toEqual({ openMintStartsAt: openMintStartsAt.toISOString() })
    }
    expect((await readCollection()).schedule.phase).toBe('waitlistWindow')
  })

  it('stops minting on the backup opening date (PASS_MINT_CLOSED)', async () => {
    await startServer({
      PASS_BACKUP_OPENING_AT: new Date(Date.now() - HOUR_MILLISECONDS).toISOString(),
    })

    const response = await requestMint(await signInNewPlayer(), takeDesignNumber())

    expectApiError(response, 409, 'PASS_MINT_CLOSED')
    expect((await readCollection()).schedule).toMatchObject({
      phase: 'openToAll',
      nextPhaseAt: null,
    })
  })
})

describe('GET /v1/pass/collection', () => {
  it('shows a queued mint as pending, then as minted with the live line', async () => {
    await startServer()
    const player = await signInNewPlayer()
    const designNumber = takeDesignNumber()
    expectMint(await requestMint(player, designNumber), 201)

    const beforeOutbox = await readCollection()
    await runOutboxJob(server)
    await server.close()
    // A new server, so the chain read isn't the cached one from before the mint.
    await startServer()
    const afterOutbox = await readCollection()

    expect(beforeOutbox.pendingDesignNumbers).toContain(designNumber)
    expect(beforeOutbox.mintedDesignNumbers).not.toContain(designNumber)
    expect(afterOutbox.mintedDesignNumbers).toContain(designNumber)
    expect(afterOutbox.pendingDesignNumbers).not.toContain(designNumber)
    expect(afterOutbox).toMatchObject({ designCount: 1000, isEarlyAccessGateOn: false })
    expect(afterOutbox.schedule).toMatchObject({
      phase: 'openMint',
      waitlistWindowStartsAt: new Date(
        TEST_PASS_SCHEDULE_VARIABLES.PASS_WAITLIST_WINDOW_STARTS_AT,
      ).toISOString(),
    })
  })

  it('opens the pass routes and SIWE to the website, and nothing else', async () => {
    await startServer()
    const preflight = (url: string, origin = TEST_WAITLIST_ALLOWED_ORIGIN) =>
      server.inject({
        method: 'OPTIONS',
        url,
        headers: {
          origin,
          'access-control-request-method': 'POST',
          'access-control-request-headers': 'authorization,content-type',
        },
      })

    for (const url of [
      '/v1/pass/mints',
      '/v1/pass/collection',
      '/v1/auth/nonce',
      '/v1/auth/refresh',
    ]) {
      expect((await preflight(url)).headers['access-control-allow-origin']).toBe(
        TEST_WAITLIST_ALLOWED_ORIGIN,
      )
    }
    expect(
      (await preflight('/v1/pass/mints', 'https://evil.example')).headers[
        'access-control-allow-origin'
      ],
    ).toBeUndefined()
    expect((await preflight('/v1/me')).headers['access-control-allow-origin']).toBeUndefined()
  })
})

async function startServer(environmentOverrides: Record<string, string> = {}): Promise<void> {
  server = await buildTestServer({
    monadRpcUrl: testChain.rpcUrl,
    contractAddresses,
    environmentOverrides,
  })
}

async function signInNewPlayer(): Promise<TestPlayer> {
  const playerAccount = privateKeyToAccount(generatePrivateKey())
  const { accessToken } = await signInTestPlayer(server, playerAccount)
  return { playerAccount, accessToken, email: `${playerAccount.address.toLowerCase()}@example.com` }
}

function takeDesignNumber(): number {
  lastUsedDesignNumber += 1
  return lastUsedDesignNumber
}

async function requestMint(
  { accessToken, email }: TestPlayer,
  designNumber: number,
  overrides: { emailProof?: string; turnstileToken?: string } = {},
): Promise<LightMyRequestResponse> {
  return server.inject({
    method: 'POST',
    url: '/v1/pass/mints',
    headers: { authorization: `Bearer ${accessToken}` },
    payload: {
      designNumber,
      emailProof: overrides.emailProof ?? (await signTestEmailProof(email)),
      turnstileToken: overrides.turnstileToken ?? TEST_TURNSTILE_TOKEN,
    },
    remoteAddress: buildTestRemoteAddress(),
  })
}

async function readMint({ accessToken }: TestPlayer, mintId: string): Promise<FoundingPassMint> {
  const response = await server.inject({
    method: 'GET',
    url: `/v1/pass/mints/${mintId}`,
    headers: { authorization: `Bearer ${accessToken}` },
    remoteAddress: buildTestRemoteAddress(),
  })
  return expectMint(response, 200)
}

async function readCollection() {
  const response = await server.inject({
    method: 'GET',
    url: '/v1/pass/collection',
    remoteAddress: buildTestRemoteAddress(),
  })
  expect(response.statusCode).toBe(200)
  return foundingPassCollectionResponseSchema.parse(response.json())
}

function joinWaitlist(email: string, createdAt: Date): Promise<void> {
  return insertWaitlistSignupIfNew(server.mongo.database, {
    email,
    phonePlatform: null,
    source: null,
    createdAt,
  })
}

function readPassOwner(designNumber: number) {
  return server.chain.publicClient.readContract({
    address: contractAddresses.foundingPass,
    abi: foundingPassAbi,
    functionName: 'ownerOf',
    args: [BigInt(designNumber)],
  })
}

function expectMint(response: LightMyRequestResponse, statusCode: number): FoundingPassMint {
  expect(response.statusCode, response.body).toBe(statusCode)
  return foundingPassMintResponseSchema.parse(response.json()).mint
}

function expectApiError(response: LightMyRequestResponse, statusCode: number, code: ApiErrorCode) {
  expect(response.statusCode, response.body).toBe(statusCode)
  const errorBody = apiErrorResponseSchema.parse(response.json())
  expect(errorBody.error.code).toBe(code)
  return errorBody
}
