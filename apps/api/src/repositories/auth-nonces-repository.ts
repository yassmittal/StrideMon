import { type Collection, type Db, ObjectId } from 'mongodb'

export type AuthNonceDocument = {
  _id: ObjectId
  nonce: string
  /** Lowercase. The only wallet allowed to use this nonce. */
  walletAddress: string
  /** A TTL index deletes the document after this. */
  expiresAt: Date
  createdAt: Date
}

export function getAuthNoncesCollection(database: Db): Collection<AuthNonceDocument> {
  return database.collection<AuthNonceDocument>('authNonces')
}

export async function insertAuthNonce(
  database: Db,
  authNonce: Omit<AuthNonceDocument, '_id'>,
): Promise<void> {
  await getAuthNoncesCollection(database).insertOne({
    ...authNonce,
    _id: new ObjectId(),
    walletAddress: authNonce.walletAddress.toLowerCase(),
  })
}

/**
 * Deletes the nonce and returns it, but only while it's unexpired. A nonce can
 * therefore be used once: a replayed message finds nothing. The TTL monitor runs
 * only about once a minute, so expiry is checked here too.
 */
export function deleteUnexpiredAuthNonce(
  database: Db,
  { nonce, now }: { nonce: string; now: Date },
): Promise<AuthNonceDocument | null> {
  return getAuthNoncesCollection(database).findOneAndDelete({ nonce, expiresAt: { $gt: now } })
}
