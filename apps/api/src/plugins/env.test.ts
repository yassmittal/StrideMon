import { describe, expect, it } from 'bun:test'
import { monadTestnet } from '@stridemon/chain'
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
}

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
    })
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
})
