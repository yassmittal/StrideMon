import fastifyPlugin from 'fastify-plugin'
import { getAuthNoncesCollection } from '../repositories/auth-nonces-repository'
import { getAuthSessionsCollection } from '../repositories/auth-sessions-repository'
import { getUsersCollection } from '../repositories/users-repository'

/**
 * Every index from docs/architecture/data-model.md, created at boot.
 * `createIndexes` is a no-op for an index that already exists with the same spec.
 */
export const mongoIndexesPlugin = fastifyPlugin(
  async (fastify) => {
    const { database } = fastify.mongo

    await getUsersCollection(database).createIndexes([{ key: { walletAddress: 1 }, unique: true }])
    await getAuthNoncesCollection(database).createIndexes([
      { key: { nonce: 1 }, unique: true },
      { key: { expiresAt: 1 }, expireAfterSeconds: 0 },
    ])
    await getAuthSessionsCollection(database).createIndexes([
      { key: { refreshTokenHash: 1 }, unique: true },
      { key: { userId: 1 } },
      { key: { expiresAt: 1 }, expireAfterSeconds: 0 },
    ])
  },
  { name: 'mongo-indexes', dependencies: ['mongo'] },
)
