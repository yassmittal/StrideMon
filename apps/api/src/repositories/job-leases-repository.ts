import { type Collection, type Db, MongoServerError } from 'mongodb'

const MONGO_DUPLICATE_KEY_ERROR_CODE = 11000

export type JobLeaseDocument = {
  /** The job name, e.g. `processChainTransactions`. */
  _id: string
  /** `<hostname>:<apiPort>` of the process holding it (D-019). */
  holderId: string
  /** Anyone may take the lease after this. */
  expiresAt: Date
  updatedAt: Date
}

export function getJobLeasesCollection(database: Db): Collection<JobLeaseDocument> {
  return database.collection<JobLeaseDocument>('jobLeases')
}

/**
 * Takes the job's lease if it's free, expired, or already ours (which renews it).
 * Returns false while another process holds it. One atomic write, so two
 * processes can never both win.
 */
export async function acquireJobLease(
  database: Db,
  {
    jobName,
    holderId,
    leaseDurationMilliseconds,
    now,
  }: { jobName: string; holderId: string; leaseDurationMilliseconds: number; now: Date },
): Promise<boolean> {
  try {
    await getJobLeasesCollection(database).updateOne(
      { _id: jobName, $or: [{ holderId }, { expiresAt: { $lte: now } }] },
      {
        $set: {
          holderId,
          expiresAt: new Date(now.getTime() + leaseDurationMilliseconds),
          updatedAt: now,
        },
      },
      { upsert: true },
    )
    return true
  } catch (error) {
    // The filter missed because someone else holds a live lease, so the upsert
    // tried to insert a second document with the same `_id`.
    if (error instanceof MongoServerError && error.code === MONGO_DUPLICATE_KEY_ERROR_CODE) {
      return false
    }
    throw error
  }
}

/** Gives the lease up at shutdown, so a restarted process can take over at once. */
export async function releaseJobLease(
  database: Db,
  { jobName, holderId }: { jobName: string; holderId: string },
): Promise<void> {
  await getJobLeasesCollection(database).deleteOne({ _id: jobName, holderId })
}
