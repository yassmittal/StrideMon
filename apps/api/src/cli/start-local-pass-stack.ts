/**
 * A whole Founding Pass stack on this laptop, for testing the website's mint (D-045): its own
 * Anvil, the contracts, a throwaway database and the API, never testnet.
 *
 *   bun run db:start                                   (from the repo root, once)
 *   bun run contracts:build                            (from the repo root, after a contract change)
 *   cd apps/api && bun run pass:local-stack [flags]
 *
 * Flags:
 *   --phase preview|waitlistWindow|openMint|openToAll  the schedule's phase now (default openMint)
 *   --waitlist-email <email>      on the waitlist from before the window opened (repeatable)
 *   --premint <count>             mint this many passes first, from #1000 down (999 leaves #0001)
 *   --turnstile pass|fail         Cloudflare's test secret that always passes or always fails
 *   --slow-blocks                 a block every 15 seconds, so a mint takes a while
 *   --origin <origin>             another site origin to allow, which also becomes the SIWE
 *                                 domain (a phone on the LAN, or a tunnel's https address)
 *   --early-access                the early-access gate on, so only pass holders get a Sneaker
 *                                 in the app (D-046)
 *
 * It builds the API's whole environment itself and never reads `apps/api/.env` (the real one
 * holds the game-server key). The Anvil shares chain id 10143 with the testnet, so the contracts
 * go through the API tests' helper, never `forge script`, and `deployments/10143.json` is never
 * touched (D-019). It also prints the app's `.env` lines for a phone on the same Wi-Fi (D-046).
 * Ctrl+C stops everything.
 */
import { networkInterfaces } from 'node:os'
import { parseArgs } from 'node:util'
import { foundingPassAbi, monadTestnet } from '@stridemon/chain'
import { MongoClient } from 'mongodb'
import { type Address, createTestClient, createWalletClient, http, publicActions } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { buildServer } from '../build-server'
import {
  ANVIL_GAME_SERVER_PRIVATE_KEY,
  deployTestContracts,
} from '../test-support/deploy-test-contracts'
import { MULTICALL3_RUNTIME_BYTECODE } from '../test-support/multicall3-runtime-bytecode'

const ANVIL_PORT = 8546
const API_PORT = 3001
const SITE_ORIGIN = 'http://localhost:3000'
const SITE_DOMAIN = 'localhost:3000'
const MONGODB_URI = 'mongodb://127.0.0.1:27019/stridemon-pass-local'
/** Monad's contract size limit (MIP-2): the pass art renderer is over Ethereum's 24 KB (D-042). */
const MONAD_CONTRACT_SIZE_LIMIT_BYTES = 128 * 1024
const SLOW_BLOCK_SECONDS = 15
const DESIGN_COUNT = 1000

const MILLISECONDS_PER_MINUTE = 60_000
const MILLISECONDS_PER_HOUR = 60 * MILLISECONDS_PER_MINUTE
const MILLISECONDS_PER_DAY = 24 * MILLISECONDS_PER_HOUR
const WAITLIST_WINDOW_HOURS = 48

// Cloudflare's published Turnstile test secrets: one always passes, one always fails.
const TURNSTILE_TEST_SECRETS = {
  pass: '1x0000000000000000000000000000000AA',
  fail: '2x0000000000000000000000000000000AA',
} as const

const LOCAL_SCHEDULE_PHASES = ['preview', 'waitlistWindow', 'openMint', 'openToAll'] as const
type LocalSchedulePhase = (typeof LOCAL_SCHEDULE_PHASES)[number]

const { values: options } = parseArgs({
  options: {
    phase: { type: 'string', default: 'openMint' },
    'waitlist-email': { type: 'string', multiple: true, default: [] },
    premint: { type: 'string', default: '0' },
    turnstile: { type: 'string', default: 'pass' },
    'slow-blocks': { type: 'boolean', default: false },
    origin: { type: 'string' },
    'early-access': { type: 'boolean', default: false },
  },
})

const phase = readPhase(options.phase)
const premintCount = Number(options.premint)
if (!Number.isInteger(premintCount) || premintCount < 0 || premintCount > DESIGN_COUNT) {
  throw new Error(`--premint must be a whole number from 0 to ${DESIGN_COUNT}`)
}
if (options.turnstile !== 'pass' && options.turnstile !== 'fail') {
  throw new Error('--turnstile must be pass or fail')
}
const extraOrigin = options.origin === undefined ? null : new URL(options.origin).origin
const now = new Date()
const scheduleTimes = buildScheduleTimes(phase, now)

const anvilProcess = Bun.spawn(
  [
    'anvil',
    '--host',
    '0.0.0.0',
    '--port',
    String(ANVIL_PORT),
    '--chain-id',
    String(monadTestnet.id),
    '--code-size-limit',
    String(MONAD_CONTRACT_SIZE_LIMIT_BYTES),
  ],
  { stdout: 'ignore', stderr: 'inherit' },
)
process.on('exit', () => anvilProcess.kill())
// Ctrl+C or a kill: leave through 'exit', so Anvil stops too.
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.on(signal, () => process.exit(0))
const rpcUrl = `http://127.0.0.1:${ANVIL_PORT}`
await waitForAnvil(rpcUrl)

await installMulticall3(rpcUrl)
const contractAddresses = await deployTestContracts(rpcUrl)
await premintFoundingPasses({ rpcUrl, foundingPass: contractAddresses.foundingPass, premintCount })

const mongoClient = new MongoClient(MONGODB_URI)
await mongoClient.connect()
await mongoClient.db().dropDatabase()
const waitlistEmails = options['waitlist-email'].map((email) => email.trim().toLowerCase())
if (waitlistEmails.length > 0) {
  await mongoClient
    .db()
    .collection('waitlistSignups')
    .insertMany(
      waitlistEmails.map((email) => ({
        email,
        phonePlatform: null,
        source: 'local-stack',
        // A day before the window, so the waitlist window lets this email mint.
        createdAt: new Date(scheduleTimes.waitlistWindowStartsAt.getTime() - MILLISECONDS_PER_DAY),
      })),
    )
}
await mongoClient.close()

if (options['slow-blocks']) {
  const testClient = createTestClient({
    mode: 'anvil',
    chain: monadTestnet,
    transport: http(rpcUrl),
  })
  await testClient.setAutomine(false)
  await testClient.setIntervalMining({ interval: SLOW_BLOCK_SECONDS })
}

const server = await buildServer({
  environmentVariables: {
    NODE_ENV: 'development',
    API_PORT: String(API_PORT),
    MONGODB_URI,
    JWT_ACCESS_TOKEN_SECRET: 'local-pass-stack-access-token-secret-'.repeat(3),
    ACCESS_TOKEN_TTL_SECONDS: '900',
    REFRESH_TOKEN_TTL_DAYS: '30',
    SIWE_DOMAIN: extraOrigin === null ? SITE_DOMAIN : new URL(extraOrigin).host,
    MONAD_RPC_URL: rpcUrl,
    MONAD_CHAIN_ID: String(monadTestnet.id),
    GAME_SERVER_PRIVATE_KEY: ANVIL_GAME_SERVER_PRIVATE_KEY,
    GAS_DRIP_AMOUNT_WEI: '100000000000000000',
    WAITLIST_ALLOWED_ORIGINS: [SITE_ORIGIN, extraOrigin]
      .filter((origin) => origin !== null)
      .join(','),
    EARLY_ACCESS_REQUIRED: String(options['early-access']),
    PASS_WAITLIST_WINDOW_STARTS_AT: scheduleTimes.waitlistWindowStartsAt.toISOString(),
    PASS_WAITLIST_WINDOW_HOURS: String(WAITLIST_WINDOW_HOURS),
    PASS_BACKUP_OPENING_AT: scheduleTimes.backupOpeningAt.toISOString(),
    TURNSTILE_SECRET_KEY: TURNSTILE_TEST_SECRETS[options.turnstile],
    EMAIL_PROOF_SECRET: 'local-pass-stack-email-proof-secret-'.repeat(3),
    EMAIL_SENDER_ADDRESS: 'hello@stridemon.test',
    // The help chatbot answers for real when apps/api/.env has the key (D-048); it costs cents.
    ...(process.env.BEDROCK_API_KEY === undefined
      ? {}
      : { BEDROCK_API_KEY: process.env.BEDROCK_API_KEY }),
    HELP_CHAT_MONTHLY_CAP_USD: '5',
  },
  contractAddresses,
  passServices: {
    // Development never sends email (D-043): the code is printed here instead.
    emailSender: {
      sendEmail: async ({ toEmailAddress, subject, textBody }) => {
        process.stdout.write(`\n── Email to ${toEmailAddress}: ${subject}\n${textBody}\n──\n\n`)
      },
    },
  },
})
await server.listen({ port: API_PORT, host: '0.0.0.0' })
const lanAddress = readLanAddress()

process.stdout.write(`
Local Founding Pass stack (D-045). Nothing here touches testnet.

  Phase        ${phase} (window ${scheduleTimes.waitlistWindowStartsAt.toISOString()})
  Premints     ${premintCount}${waitlistEmails.length > 0 ? `\n  Waitlist     ${waitlistEmails.join(', ')}` : ''}
  Turnstile    always ${options.turnstile === 'pass' ? 'passes' : 'fails'}${options['slow-blocks'] ? `\n  Blocks       one every ${SLOW_BLOCK_SECONDS} s` : ''}
  Gate         ${options['early-access'] ? 'on: only pass holders get a Sneaker' : 'off'}
  Anvil        ${rpcUrl} (chain ${monadTestnet.id})
  API          http://localhost:${API_PORT}
  FoundingPass ${contractAddresses.foundingPass}

Start the website against it (from website/):

  NEXT_PUBLIC_API_BASE_URL=http://localhost:${API_PORT} \\
  NEXT_PUBLIC_MONAD_RPC_URL=${rpcUrl} \\
  NEXT_PUBLIC_FOUNDING_PASS_ADDRESS=${contractAddresses.foundingPass} \\
  NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA \\
  bun run dev

Point the app at it (apps/mobile/.env, then \`bunx expo start --clear\`; device-testing.md §11):

  EXPO_PUBLIC_API_BASE_URL=http://${lanAddress}:${API_PORT}
  EXPO_PUBLIC_MONAD_RPC_URL=http://${lanAddress}:${ANVIL_PORT}
  EXPO_PUBLIC_SNEAKER_NFT_ADDRESS=${contractAddresses.sneakerNft}
  EXPO_PUBLIC_STRIDE_TOKEN_ADDRESS=${contractAddresses.strideToken}
  EXPO_PUBLIC_SNEAKER_GAME_ADDRESS=${contractAddresses.sneakerGame}
  EXPO_PUBLIC_FOUNDING_PASS_ADDRESS=${contractAddresses.foundingPass}

Email codes print here. Ctrl+C stops it all.
`)

/** This laptop's Wi-Fi address, which a phone on the same network can reach. */
function readLanAddress(): string {
  const addresses = Object.values(networkInterfaces()).flatMap((entries) => entries ?? [])
  const lanAddress = addresses.find((entry) => entry.family === 'IPv4' && !entry.internal)
  return lanAddress?.address ?? "<this laptop's Wi-Fi IP>"
}

function readPhase(phaseText: string | undefined): LocalSchedulePhase {
  const matchingPhase = LOCAL_SCHEDULE_PHASES.find((localPhase) => localPhase === phaseText)
  if (matchingPhase === undefined) {
    throw new Error(`--phase must be one of: ${LOCAL_SCHEDULE_PHASES.join(', ')}`)
  }
  return matchingPhase
}

/** Times that put the schedule in `phase` now (the open mint ends 14 days after it starts). */
function buildScheduleTimes(
  localPhase: LocalSchedulePhase,
  startedAt: Date,
): { waitlistWindowStartsAt: Date; backupOpeningAt: Date } {
  const windowLengthMilliseconds = WAITLIST_WINDOW_HOURS * MILLISECONDS_PER_HOUR
  const openMintLengthMilliseconds = 14 * MILLISECONDS_PER_DAY
  const waitlistWindowStartsAtMilliseconds = {
    preview: startedAt.getTime() + MILLISECONDS_PER_HOUR,
    waitlistWindow: startedAt.getTime() - MILLISECONDS_PER_MINUTE,
    openMint: startedAt.getTime() - windowLengthMilliseconds - MILLISECONDS_PER_HOUR,
    openToAll:
      startedAt.getTime() -
      windowLengthMilliseconds -
      openMintLengthMilliseconds -
      MILLISECONDS_PER_MINUTE,
  }[localPhase]
  return {
    waitlistWindowStartsAt: new Date(waitlistWindowStartsAtMilliseconds),
    backupOpeningAt: new Date(
      waitlistWindowStartsAtMilliseconds + windowLengthMilliseconds + openMintLengthMilliseconds,
    ),
  }
}

async function waitForAnvil(anvilRpcUrl: string): Promise<void> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(anvilRpcUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_chainId', params: [] }),
      })
      if (response.ok) return
    } catch {
      // Not listening yet.
    }
    await Bun.sleep(200)
  }
  throw new Error(
    `Anvil didn't start on port ${ANVIL_PORT}. Is Foundry installed, and is the port free?`,
  )
}

/**
 * Multicall3 at its usual address (D-046): the app batches its reads through the address in the
 * chain definition, and a bare Anvil has no contract there.
 */
async function installMulticall3(anvilRpcUrl: string): Promise<void> {
  const testClient = createTestClient({
    mode: 'anvil',
    chain: monadTestnet,
    transport: http(anvilRpcUrl),
  })
  await testClient.setCode({
    address: monadTestnet.contracts.multicall3.address,
    bytecode: MULTICALL3_RUNTIME_BYTECODE,
  })
}

/** Passes minted straight from the game-server key to throwaway wallets, from #1000 down. */
async function premintFoundingPasses({
  rpcUrl: anvilRpcUrl,
  foundingPass,
  premintCount: count,
}: {
  rpcUrl: string
  foundingPass: Address
  premintCount: number
}): Promise<void> {
  if (count === 0) return
  const gameServerClient = createWalletClient({
    account: privateKeyToAccount(ANVIL_GAME_SERVER_PRIVATE_KEY),
    chain: monadTestnet,
    transport: http(anvilRpcUrl),
  }).extend(publicActions)
  let lastTransactionHash: `0x${string}` | null = null
  for (let mintIndex = 0; mintIndex < count; mintIndex += 1) {
    lastTransactionHash = await gameServerClient.writeContract({
      address: foundingPass,
      abi: foundingPassAbi,
      functionName: 'mint',
      // One pass per wallet: each goes to its own made-up address.
      args: [
        `0x${(0x10000 + mintIndex).toString(16).padStart(40, '0')}`,
        BigInt(DESIGN_COUNT - mintIndex),
      ],
    })
  }
  if (lastTransactionHash !== null) {
    await gameServerClient.waitForTransactionReceipt({ hash: lastTransactionHash })
  }
}
