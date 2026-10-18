import { type Collection, type Db, MongoServerError } from 'mongodb'

const MONGO_DUPLICATE_KEY_ERROR_CODE = 11000
// A day's count is only needed that day; keep about a week to look back at.
const RETENTION_MILLISECONDS = 8 * 24 * 60 * 60 * 1000

/**
 * How many emails the API sent on one UTC day (data-model.md → emailDailyCounts, D-057). A count
 * only: never an address.
 */
export type EmailDailyCountDocument = {
  /** The UTC day, `2026-11-28`. */
  _id: string
  sentEmailCount: number
  /** TTL index deletes it. */
  expiresAt: Date
  updatedAt: Date
}

export function getEmailDailyCountsCollection(database: Db): Collection<EmailDailyCountDocument> {
  return database.collection<EmailDailyCountDocument>('emailDailyCounts')
}

/**
 * Counts one email for the day before it's sent. With a `limit`, only while the day's count is
 * under it: `false` means the day is full. One conditional write, so two requests can't both take
 * the last place.
 */
export async function takeDailyEmailPlace(
  database: Db,
  { utcDay, limit, now }: { utcDay: string; limit: number | null; now: Date },
): Promise<boolean> {
  try {
    await getEmailDailyCountsCollection(database).updateOne(
      limit === null ? { _id: utcDay } : { _id: utcDay, sentEmailCount: { $lt: limit } },
      {
        $inc: { sentEmailCount: 1 },
        $set: { updatedAt: now },
        $setOnInsert: { expiresAt: new Date(Date.parse(utcDay) + RETENTION_MILLISECONDS) },
      },
      { upsert: true },
    )
    return true
  } catch (error) {
    // The day is full: the filter missed it, and the upsert hit the day's _id.
    if (error instanceof MongoServerError && error.code === MONGO_DUPLICATE_KEY_ERROR_CODE) {
      return false
    }
    throw error
  }
}

/** Gives the place back after the provider refused the email, so nothing went out. */
export async function giveBackDailyEmailPlace(
  database: Db,
  { utcDay, now }: { utcDay: string; now: Date },
): Promise<void> {
  await getEmailDailyCountsCollection(database).updateOne(
    { _id: utcDay, sentEmailCount: { $gt: 0 } },
    { $inc: { sentEmailCount: -1 }, $set: { updatedAt: now } },
  )
}

export async function readDailyEmailCount(database: Db, utcDay: string): Promise<number> {
  const dailyCount = await getEmailDailyCountsCollection(database).findOne({ _id: utcDay })
  return dailyCount?.sentEmailCount ?? 0
}
