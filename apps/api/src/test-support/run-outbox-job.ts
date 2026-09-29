import type { FastifyInstance } from 'fastify'
import { processChainTransactions } from '../jobs/process-chain-transactions'

/**
 * One outbox run, as the background runner would do it while holding the lease.
 * Tests call this instead of waiting for the interval, which doesn't run under test.
 */
export function runOutboxJob(
  server: FastifyInstance,
  { holdsLease = true }: { holdsLease?: boolean } = {},
): Promise<void> {
  return processChainTransactions({
    database: server.mongo.database,
    chainClients: server.chain,
    contractAddresses: server.config.contractAddresses,
    renewJobLease: async () => holdsLease,
    log: server.log,
  })
}
