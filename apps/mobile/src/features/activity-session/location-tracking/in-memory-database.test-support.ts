/// <reference types="node" />
import { DatabaseSync, type SQLInputValue } from 'node:sqlite'
import type { SQLiteBindValue } from 'expo-sqlite'
import { createActivitySessionTables, type LocalDatabase } from './activity-session-database'

/**
 * A real SQLite database in memory, from Node's built-in `node:sqlite`, behind the
 * same narrow interface the app gets from expo-sqlite. Tests run the app's actual
 * SQL instead of a fake of it.
 */
export async function createInMemoryActivitySessionDatabase(): Promise<LocalDatabase> {
  const database = new DatabaseSync(':memory:')
  const localDatabase: LocalDatabase = {
    execAsync: async (source) => {
      database.exec(source)
    },
    runAsync: async (source, params) => database.prepare(source).run(...toSqlInputs(params)),
    getAllAsync: async <Row>(source: string, params: SQLiteBindValue[]) =>
      database.prepare(source).all(...toSqlInputs(params)) as Row[],
    getFirstAsync: async <Row>(source: string, params: SQLiteBindValue[]) =>
      (database.prepare(source).get(...toSqlInputs(params)) as Row | undefined) ?? null,
  }
  await createActivitySessionTables(localDatabase)
  return localDatabase
}

// expo-sqlite also binds booleans and raw ArrayBuffers; node:sqlite wants numbers and views.
function toSqlInputs(params: SQLiteBindValue[]): SQLInputValue[] {
  return params.map((param) => {
    if (typeof param === 'boolean') return Number(param)
    if (param instanceof ArrayBuffer) return new Uint8Array(param)
    return param
  })
}
