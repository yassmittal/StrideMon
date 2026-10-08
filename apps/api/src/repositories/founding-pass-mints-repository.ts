import type { FoundingPassMintFailureCode, FoundingPassMintStatus } from '@stridemon/shared/domain'
import { type Collection, type Db, MongoServerError, ObjectId } from 'mongodb'

const MONGO_DUPLICATE_KEY_ERROR_CODE = 11000

/** Mints that hold their design, email and wallet: every one but a failed one. */
export const LIVE_FOUNDING_PASS_MINT_STATUSES: readonly FoundingPassMintStatus[] = [
  'queued',
  'confirmed',
]

/** One per mint request (data-model.md → foundingPassMints). The chain is the truth for owners. */
export type FoundingPassMintDocument = {
  _id: ObjectId
  designNumber: number
  /** Lowercased, from the email proof. */
  email: string
  /** Lowercase. */
  walletAddress: string
  status: FoundingPassMintStatus
  founderNumber: number | null
  hasGoldFrame: boolean | null
  transactionHash: string | null
  failureCode: FoundingPassMintFailureCode | null
  mintedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

/** Which unique claim a refused insert ran into. */
export type FoundingPassMintConflict = 'designNumber' | 'email' | 'walletAddress'

const CONFLICT_FIELDS: readonly FoundingPassMintConflict[] = [
  'designNumber',
  'email',
  'walletAddress',
]

export function getFoundingPassMintsCollection(database: Db): Collection<FoundingPassMintDocument> {
  return database.collection<FoundingPassMintDocument>('foundingPassMints')
}

/**
 * Records a queued mint. The partial unique indexes let one live mint per design, email and wallet
 * through, so two racing requests can't both take a design: the loser gets the conflict back.
 */
export async function insertFoundingPassMint(
  database: Db,
  {
    designNumber,
    email,
    walletAddress,
    now,
  }: { designNumber: number; email: string; walletAddress: string; now: Date },
): Promise<
  { foundingPassMint: FoundingPassMintDocument } | { conflict: FoundingPassMintConflict }
> {
  const newMint: FoundingPassMintDocument = {
    _id: new ObjectId(),
    designNumber,
    email,
    walletAddress: walletAddress.toLowerCase(),
    status: 'queued',
    founderNumber: null,
    hasGoldFrame: null,
    transactionHash: null,
    failureCode: null,
    mintedAt: null,
    createdAt: now,
    updatedAt: now,
  }
  try {
    await getFoundingPassMintsCollection(database).insertOne(newMint)
    return { foundingPassMint: newMint }
  } catch (error) {
    const conflict = findConflictField(error)
    if (conflict === null) throw error
    return { conflict }
  }
}

export function findFoundingPassMintById(
  database: Db,
  mintId: ObjectId,
): Promise<FoundingPassMintDocument | null> {
  return getFoundingPassMintsCollection(database).findOne({ _id: mintId })
}

export function findLiveFoundingPassMintByEmail(
  database: Db,
  email: string,
): Promise<FoundingPassMintDocument | null> {
  return getFoundingPassMintsCollection(database).findOne({
    email,
    status: { $in: [...LIVE_FOUNDING_PASS_MINT_STATUSES] },
  })
}

export function findLiveFoundingPassMintByWallet(
  database: Db,
  walletAddress: string,
): Promise<FoundingPassMintDocument | null> {
  return getFoundingPassMintsCollection(database).findOne({
    walletAddress: walletAddress.toLowerCase(),
    status: { $in: [...LIVE_FOUNDING_PASS_MINT_STATUSES] },
  })
}

/**
 * Designs the chain may not show yet: mints still queued, and mints confirmed since `confirmedSince`
 * (the cached chain read's time).
 */
export async function listPendingFoundingPassDesignNumbers(
  database: Db,
  { confirmedSince }: { confirmedSince: Date },
): Promise<number[]> {
  const pendingMints = await getFoundingPassMintsCollection(database)
    .find(
      {
        $or: [{ status: 'queued' }, { status: 'confirmed', updatedAt: { $gte: confirmedSince } }],
      },
      { projection: { designNumber: 1 } },
    )
    .toArray()
  return pendingMints.map((pendingMint) => pendingMint.designNumber)
}

/** The newest confirmed mints, for the gallery's live line. */
export function listRecentConfirmedFoundingPassMints(
  database: Db,
  limit: number,
): Promise<FoundingPassMintDocument[]> {
  return getFoundingPassMintsCollection(database)
    .find({ status: 'confirmed' })
    .sort({ updatedAt: -1, _id: -1 })
    .limit(limit)
    .toArray()
}

/** Written by the outbox job from the `FoundingPassMinted` event. */
export async function markFoundingPassMintConfirmed(
  database: Db,
  {
    mintId,
    founderNumber,
    hasGoldFrame,
    transactionHash,
    now,
  }: {
    mintId: ObjectId
    founderNumber: number
    hasGoldFrame: boolean
    transactionHash: string
    now: Date
  },
): Promise<void> {
  await getFoundingPassMintsCollection(database).updateOne(
    { _id: mintId },
    {
      $set: {
        status: 'confirmed',
        founderNumber,
        hasGoldFrame,
        transactionHash,
        mintedAt: now,
        updatedAt: now,
      },
    },
  )
}

/** A refused mint frees its design, email and wallet. A confirmed one never goes back. */
export async function markFoundingPassMintFailed(
  database: Db,
  {
    mintId,
    failureCode,
    now,
  }: { mintId: ObjectId; failureCode: FoundingPassMintFailureCode; now: Date },
): Promise<void> {
  await getFoundingPassMintsCollection(database).updateOne(
    { _id: mintId, status: 'queued' },
    { $set: { status: 'failed', failureCode, updatedAt: now } },
  )
}

function findConflictField(error: unknown): FoundingPassMintConflict | null {
  if (!(error instanceof MongoServerError) || error.code !== MONGO_DUPLICATE_KEY_ERROR_CODE) {
    return null
  }
  const keyPattern: unknown = error.keyPattern
  if (typeof keyPattern !== 'object' || keyPattern === null) return null
  return CONFLICT_FIELDS.find((field) => field in keyPattern) ?? null
}
