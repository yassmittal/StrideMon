import fastifyPlugin from 'fastify-plugin'
import { getActivitySessionsCollection } from '../repositories/activity-sessions-repository'
import { getAuthNoncesCollection } from '../repositories/auth-nonces-repository'
import { getAuthSessionsCollection } from '../repositories/auth-sessions-repository'
import { getChainTransactionsCollection } from '../repositories/chain-transactions-repository'
import { getLocationSamplesCollection } from '../repositories/location-samples-repository'
import { getUsersCollection } from '../repositories/users-repository'
import { getWaitlistSignupsCollection } from '../repositories/waitlist-signups-repository'

const SECONDS_PER_DAY = 86_400
const LOCATION_SAMPLE_RETENTION_SECONDS = 30 * SECONDS_PER_DAY

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
    await getChainTransactionsCollection(database).createIndexes([
      { key: { idempotencyKey: 1 }, unique: true },
      { key: { status: 1, createdAt: 1 } },
    ])
    await getActivitySessionsCollection(database).createIndexes([
      { key: { userId: 1, createdAt: -1 } },
      // The database, not a read-then-check, enforces one active session per wallet and per Sneaker.
      {
        key: { walletAddress: 1 },
        unique: true,
        partialFilterExpression: { status: 'active' },
        name: 'oneActiveSessionPerWallet',
      },
      {
        key: { sneakerTokenId: 1 },
        unique: true,
        partialFilterExpression: { status: 'active' },
        name: 'oneActiveSessionPerSneaker',
      },
      { key: { status: 1, updatedAt: 1 } },
    ])
    await getLocationSamplesCollection(database).createIndexes([
      { key: { activitySessionId: 1, sequenceNumber: 1 }, unique: true },
      // Raw GPS is kept for validation and dispute review, not forever (data-model.md).
      { key: { receivedAt: 1 }, expireAfterSeconds: LOCATION_SAMPLE_RETENTION_SECONDS },
    ])
    // One sign-up per email, so a repeat is a no-op upsert (D-037).
    await getWaitlistSignupsCollection(database).createIndexes([
      { key: { email: 1 }, unique: true },
    ])
  },
  { name: 'mongo-indexes', dependencies: ['mongo'] },
)
