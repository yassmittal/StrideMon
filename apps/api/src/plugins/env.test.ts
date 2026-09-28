import { describe, expect, it } from 'bun:test'
import { parseApiConfig } from './env'

const VALID_ENVIRONMENT_VARIABLES = {
  NODE_ENV: 'development',
  API_PORT: '3000',
  MONGODB_URI: 'mongodb://127.0.0.1:27019/stridemon',
}

describe('parseApiConfig', () => {
  it('maps valid variables to a typed config', () => {
    expect(parseApiConfig(VALID_ENVIRONMENT_VARIABLES)).toEqual({
      nodeEnvironment: 'development',
      apiPort: 3000,
      mongodbUri: 'mongodb://127.0.0.1:27019/stridemon',
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
})
