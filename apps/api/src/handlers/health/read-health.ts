import type { HealthResponse } from '@stridemon/shared/api-contracts'
import type { Db } from 'mongodb'
import { isDatabaseReachable } from '../../repositories/database-health-repository'

export async function readHealth({ database }: { database: Db }): Promise<HealthResponse> {
  const isMongoReachable = await isDatabaseReachable(database)
  return { status: 'ok', mongo: isMongoReachable ? 'connected' : 'unreachable' }
}
