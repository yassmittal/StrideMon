import type { Collection, Db, ObjectId } from 'mongodb'

export type UserDocument = {
  _id: ObjectId
  /** Lowercase. Displayed checksummed. */
  walletAddress: string
  hasReceivedStarterSneaker: boolean
  hasReceivedGasDrip: boolean
  lastSignedInAt: Date
  createdAt: Date
  updatedAt: Date
}

export function getUsersCollection(database: Db): Collection<UserDocument> {
  return database.collection<UserDocument>('users')
}

/**
 * Creates the user on their first sign-in, and records the sign-in time on every
 * one after. Returns the user as stored after the write.
 */
export async function upsertUserOnSignIn(
  database: Db,
  { walletAddress, signedInAt }: { walletAddress: string; signedInAt: Date },
): Promise<UserDocument> {
  const userDocument = await getUsersCollection(database).findOneAndUpdate(
    { walletAddress: walletAddress.toLowerCase() },
    {
      $set: { lastSignedInAt: signedInAt, updatedAt: signedInAt },
      $setOnInsert: {
        hasReceivedStarterSneaker: false,
        hasReceivedGasDrip: false,
        createdAt: signedInAt,
      },
    },
    { upsert: true, returnDocument: 'after' },
  )
  if (userDocument === null) throw new Error('Upserting the user returned no document')
  return userDocument
}

export function findUserById(database: Db, userId: ObjectId): Promise<UserDocument | null> {
  return getUsersCollection(database).findOne({ _id: userId })
}

/** Set by the outbox job once the starter mint is confirmed on-chain. */
export async function markUserReceivedStarterSneaker(
  database: Db,
  { walletAddress, now }: { walletAddress: string; now: Date },
): Promise<void> {
  await getUsersCollection(database).updateOne(
    { walletAddress: walletAddress.toLowerCase() },
    { $set: { hasReceivedStarterSneaker: true, updatedAt: now } },
  )
}

/** Set by the outbox job once the gas drip is confirmed on-chain. */
export async function markUserReceivedGasDrip(
  database: Db,
  { walletAddress, now }: { walletAddress: string; now: Date },
): Promise<void> {
  await getUsersCollection(database).updateOne(
    { walletAddress: walletAddress.toLowerCase() },
    { $set: { hasReceivedGasDrip: true, updatedAt: now } },
  )
}
