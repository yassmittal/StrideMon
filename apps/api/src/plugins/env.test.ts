import { describe, expect, it } from 'bun:test'
import { CONTRACT_ADDRESSES_BY_CHAIN_ID, monadTestnet } from '@stridemon/chain'
import { parseApiConfig } from './env'

const VALID_ENVIRONMENT_VARIABLES = {
  NODE_ENV: 'development',
  API_PORT: '3000',
  MONGODB_URI: 'mongodb://127.0.0.1:27019/stridemon',
  JWT_ACCESS_TOKEN_SECRET: 'a'.repeat(128),
  ACCESS_TOKEN_TTL_SECONDS: '900',
  REFRESH_TOKEN_TTL_DAYS: '30',
  SIWE_DOMAIN: 'stridemon.com',
  MONAD_RPC_URL: 'https://testnet-rpc.monad.xyz',
  MONAD_CHAIN_ID: '10143',
  GAME_SERVER_PRIVATE_KEY: `0x${'ab'.repeat(32)}`,
  GAS_DRIP_AMOUNT_WEI: '100000000000000000',
  WAITLIST_ALLOWED_ORIGINS: 'https://stridemon.yashmittal.xyz, http://localhost:3000',
}

const DEPLOYED_CONTRACT_ADDRESSES = CONTRACT_ADDRESSES_BY_CHAIN_ID[10143]
if (DEPLOYED_CONTRACT_ADDRESSES === undefined)
  throw new Error('No testnet deployment in @stridemon/chain')

const OVERRIDE_CONTRACT_ADDRESSES = {
  sneakerNft: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  strideToken: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  sneakerGame: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
} as const

describe('parseApiConfig', () => {
  it('maps valid variables to a typed config', () => {
    expect(parseApiConfig(VALID_ENVIRONMENT_VARIABLES)).toEqual({
      nodeEnvironment: 'development',
      apiPort: 3000,
      mongodbUri: 'mongodb://127.0.0.1:27019/stridemon',
      jwtAccessTokenSecret: 'a'.repeat(128),
      accessTokenTtlSeconds: 900,
      refreshTokenTtlDays: 30,
      siweDomain: 'stridemon.com',
      monadRpcUrl: 'https://testnet-rpc.monad.xyz',
      monadChain: monadTestnet,
      gameServerPrivateKey: `0x${'ab'.repeat(32)}`,
      gasDripAmountWei: 100_000_000_000_000_000n,
      waitlistAllowedOrigins: ['https://stridemon.yashmittal.xyz', 'http://localhost:3000'],
      contractAddresses: DEPLOYED_CONTRACT_ADDRESSES,
    })
  })

  it('uses the contract addresses it is given instead of the deployed ones', () => {
    const apiConfig = parseApiConfig(VALID_ENVIRONMENT_VARIABLES, OVERRIDE_CONTRACT_ADDRESSES)

    expect(apiConfig.contractAddresses).toEqual(OVERRIDE_CONTRACT_ADDRESSES)
  })

  it('rejects a game-server key that is not 32 bytes of hex', () => {
    expect(() =>
      parseApiConfig({ ...VALID_ENVIRONMENT_VARIABLES, GAME_SERVER_PRIVATE_KEY: '0x1234' }),
    ).toThrow(/GAME_SERVER_PRIVATE_KEY/)
  })

  it('rejects a gas drip that is not a positive whole number of wei', () => {
    expect(() =>
      parseApiConfig({ ...VALID_ENVIRONMENT_VARIABLES, GAS_DRIP_AMOUNT_WEI: '0.1' }),
    ).toThrow(/GAS_DRIP_AMOUNT_WEI/)
  })

  it('fails fast and names a missing variable', () => {
    const { MONGODB_URI: _omitted, ...withoutMongoUri } = VALID_ENVIRONMENT_VARIABLES

    expect(() => parseApiConfig(withoutMongoUri)).toThrow(/MONGODB_URI/)
  })

  it('rejects a Mongo URI that does not name a database', () => {
    expect(() =>
      parseApiConfig({ ...VALID_ENVIRONMENT_VARIABLES, MONGODB_URI: 'mongodb://127.0.0.1:27019' }),
    ).toThrow(/MONGODB_URI/)
  })

  it('rejects a JWT secret too short to be safe', () => {
    expect(() =>
      parseApiConfig({ ...VALID_ENVIRONMENT_VARIABLES, JWT_ACCESS_TOKEN_SECRET: 'short' }),
    ).toThrow(/JWT_ACCESS_TOKEN_SECRET/)
  })

  it('rejects a chain id StrideMon is not deployed to', () => {
    expect(() => parseApiConfig({ ...VALID_ENVIRONMENT_VARIABLES, MONAD_CHAIN_ID: '1' })).toThrow(
      /MONAD_CHAIN_ID: must be one of: 10143/,
    )
  })

  it('rejects a SIWE domain written as a URL', () => {
    expect(() =>
      parseApiConfig({ ...VALID_ENVIRONMENT_VARIABLES, SIWE_DOMAIN: 'https://stridemon.com' }),
    ).toThrow(/SIWE_DOMAIN/)
  })

  it('rejects a waitlist origin with a trailing slash', () => {
    expect(() =>
      parseApiConfig({
        ...VALID_ENVIRONMENT_VARIABLES,
        WAITLIST_ALLOWED_ORIGINS: 'https://stridemon.yashmittal.xyz/',
      }),
    ).toThrow(/WAITLIST_ALLOWED_ORIGINS/)
  })
})
