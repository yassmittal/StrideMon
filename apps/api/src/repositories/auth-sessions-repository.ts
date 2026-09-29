import { type Collection, type Db, ObjectId } from 'mongodb'

export type AuthSessionRevocationReason = 'rotated' | 'signedOut' | 'reuseDetected'

export type AuthSessionDocument = {
  _id: ObjectId
  userId: ObjectId
  /** SHA-256 of the refresh token. The token itself is never stored. */
  refreshTokenHash: string
  deviceLabel: string | null
  /** A TTL index deletes the document after this. */
  expiresAt: Date
  revokedAt: Date | null
  /** Set together with `revokedAt`. Only a replayed `rotated` token means it was copied. */
  revocationReason: AuthSessionRevocationReason | null
  createdAt: Date
  updatedAt: Date
}

export function getAuthSessionsCollection(database: Db): Collection<AuthSessionDocument> {
  return database.collection<AuthSessionDocument>('authSessions')
}

export async function insertAuthSession(
  database: Db,
  authSession: Omit<AuthSessionDocument, '_id'>,
): Promise<void> {
  await getAuthSessionsCollection(database).insertOne({ ...authSession, _id: new ObjectId() })
}

export function findAuthSessionByRefreshTokenHash(
  database: Db,
  refreshTokenHash: string,
): Promise<AuthSessionDocument | null> {
  return getAuthSessionsCollection(database).findOne({ refreshTokenHash })
}

/**
 * Marks the auth session `rotated` if it's still usable (not revoked, not expired)
 * and returns it. One atomic update, so two refreshes racing with the same token
 * can't both succeed. Returns `null` when nothing usable matched.
 */
export function rotateUsableAuthSession(
  database: Db,
  { refreshTokenHash, now }: { refreshTokenHash: string; now: Date },
): Promise<AuthSessionDocument | null> {
  return getAuthSessionsCollection(database).findOneAndUpdate(
    { refreshTokenHash, revokedAt: null, expiresAt: { $gt: now } },
    { $set: { revokedAt: now, revocationReason: 'rotated', updatedAt: now } },
    { returnDocument: 'after' },
  )
}

/** Signs one auth session of this user out. Does nothing if it's already revoked or someone else's. */
export async function revokeAuthSessionOfUser(
  database: Db,
  { userId, refreshTokenHash, now }: { userId: ObjectId; refreshTokenHash: string; now: Date },
): Promise<void> {
  await getAuthSessionsCollection(database).updateOne(
    { userId, refreshTokenHash, revokedAt: null },
    { $set: { revokedAt: now, revocationReason: 'signedOut', updatedAt: now } },
  )
}

/** Signs the user out everywhere. Used when a stolen refresh token is detected. */
export async function revokeAllAuthSessionsOfUser(
  database: Db,
  { userId, now }: { userId: ObjectId; now: Date },
): Promise<void> {
  await getAuthSessionsCollection(database).updateMany(
    { userId, revokedAt: null },
    { $set: { revokedAt: now, revocationReason: 'reuseDetected', updatedAt: now } },
  )
}
