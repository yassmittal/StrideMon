import type { Db } from 'mongodb'

/** True when the database answers a ping. Never throws: an outage is a reportable state, not a crash. */
export async function isDatabaseReachable(database: Db): Promise<boolean> {
  try {
    await database.command({ ping: 1 })
    return true
  } catch {
    return false
  }
}
