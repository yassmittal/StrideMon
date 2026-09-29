import { hostname } from 'node:os'
import fastifyPlugin from 'fastify-plugin'
import {
  PROCESS_CHAIN_TRANSACTIONS_JOB_NAME,
  processChainTransactions,
} from '../jobs/process-chain-transactions'
import { acquireJobLease, releaseJobLease } from '../repositories/job-leases-repository'

// A new player's mint should start within a couple of seconds of their request.
const CHAIN_TRANSACTIONS_POLL_INTERVAL_MILLISECONDS = 2_000
// Longer than one outbox step (a receipt wait is capped at 20 s), renewed between steps.
const JOB_LEASE_DURATION_MILLISECONDS = 60_000

/**
 * Runs the outbox job on an interval, in whichever API process holds its lease
 * (D-019). Doesn't start under `NODE_ENV=test`: tests call the job directly.
 */
export const backgroundJobsPlugin = fastifyPlugin(
  async (fastify) => {
    if (fastify.config.nodeEnvironment === 'test') return

    const { database } = fastify.mongo
    // Stable across restarts: a process killed without a clean shutdown (a crash,
    // or `bun --watch` reloading) never releases its lease, and its replacement on
    // the same host and port takes it straight back instead of waiting it out.
    // Two live processes can't share a host and port, so holders stay distinct.
    const holderId = `${hostname()}:${fastify.config.apiPort}`
    const jobName = PROCESS_CHAIN_TRANSACTIONS_JOB_NAME
    const log = fastify.log.child({ job: jobName })
    const renewJobLease = () =>
      acquireJobLease(database, {
        jobName,
        holderId,
        leaseDurationMilliseconds: JOB_LEASE_DURATION_MILLISECONDS,
        now: new Date(),
      })

    const repeatingJob = createRepeatingJob({
      intervalMilliseconds: CHAIN_TRANSACTIONS_POLL_INTERVAL_MILLISECONDS,
      runOnce: async () => {
        if (!(await renewJobLease())) return
        await processChainTransactions({
          database,
          chainClients: fastify.chain,
          contractAddresses: fastify.config.contractAddresses,
          renewJobLease,
          log,
        })
      },
      onError: (error) => log.error({ err: error }, 'Background job run failed'),
    })

    fastify.addHook('onReady', async () => {
      repeatingJob.start()
    })
    // preClose, not onClose: the job needs Mongo, which closes in its own onClose.
    fastify.addHook('preClose', async () => {
      await repeatingJob.stop()
      await releaseJobLease(database, { jobName, holderId })
    })
  },
  { name: 'background-jobs', dependencies: ['env', 'mongo', 'chain-clients'] },
)

type RepeatingJob = { start: () => void; stop: () => Promise<void> }

/** Runs `runOnce`, waits the interval, runs it again. Runs never overlap. */
function createRepeatingJob({
  intervalMilliseconds,
  runOnce,
  onError,
}: {
  intervalMilliseconds: number
  runOnce: () => Promise<void>
  onError: (error: unknown) => void
}): RepeatingJob {
  let nextRunTimeout: ReturnType<typeof setTimeout> | null = null
  let currentRun: Promise<void> | null = null
  let isStopped = false

  function runAndScheduleNext(): void {
    currentRun = runOnce()
      .catch(onError)
      .finally(() => {
        currentRun = null
        if (!isStopped) nextRunTimeout = setTimeout(runAndScheduleNext, intervalMilliseconds)
      })
  }

  return {
    start: runAndScheduleNext,
    stop: async () => {
      isStopped = true
      if (nextRunTimeout !== null) clearTimeout(nextRunTimeout)
      await currentRun
    },
  }
}
