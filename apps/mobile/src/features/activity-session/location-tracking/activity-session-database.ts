import { openDatabaseAsync, type SQLiteBindValue } from 'expo-sqlite'

const DATABASE_FILE_NAME = 'stridemon.db'

/**
 * The part of expo-sqlite this feature uses. Narrow on purpose: tests pass an
 * in-memory SQLite that implements just this (`in-memory-database.test-support.ts`).
 */
export type LocalDatabase = {
  execAsync: (source: string) => Promise<void>
  runAsync: (source: string, params: SQLiteBindValue[]) => Promise<unknown>
  getAllAsync: <Row>(source: string, params: SQLiteBindValue[]) => Promise<Row[]>
  getFirstAsync: <Row>(source: string, params: SQLiteBindValue[]) => Promise<Row | null>
}

// Samples are buffered here before upload and kept until the run is finished, so
// they survive the app being killed mid-run (D-020). The sample buffer and the
// run in progress share one database, so clearing a finished run is one place.
const SCHEMA_STATEMENTS = `
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS location_samples (
    activity_session_id TEXT NOT NULL,
    sequence_number INTEGER NOT NULL,
    recorded_at_milliseconds INTEGER NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    accuracy_meters REAL,
    speed_meters_per_second REAL,
    is_mocked_location INTEGER NOT NULL,
    is_uploaded INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (activity_session_id, sequence_number)
  );
  CREATE INDEX IF NOT EXISTS location_samples_by_upload_state
    ON location_samples (activity_session_id, is_uploaded, sequence_number);
  CREATE TABLE IF NOT EXISTS local_active_activity_session (
    singleton_key INTEGER PRIMARY KEY CHECK (singleton_key = 1),
    activity_session_id TEXT NOT NULL,
    sneaker_token_id TEXT NOT NULL,
    started_at TEXT NOT NULL,
    energy_at_start INTEGER NOT NULL,
    efficiency INTEGER NOT NULL
  );
`

let openingDatabase: Promise<LocalDatabase> | null = null

/**
 * Opens the app's SQLite database once per JS runtime and creates its tables.
 * The location task and the screens share this one connection, so their
 * statements run one after another.
 */
export function openActivitySessionDatabase(): Promise<LocalDatabase> {
  openingDatabase ??= openAndPrepareDatabase().catch((error: unknown) => {
    // Let the next caller try again rather than caching the failure forever.
    openingDatabase = null
    throw error
  })
  return openingDatabase
}

async function openAndPrepareDatabase(): Promise<LocalDatabase> {
  const database = await openDatabaseAsync(DATABASE_FILE_NAME)
  await createActivitySessionTables(database)
  return database
}

/** Idempotent: safe on every launch. Exported for tests' in-memory databases. */
export function createActivitySessionTables(database: LocalDatabase): Promise<void> {
  return database.execAsync(SCHEMA_STATEMENTS)
}
