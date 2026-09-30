import { hostname } from 'node:os'
import type { FastifyBaseLogger } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import {
  ABANDON_STALE_ACTIVITY_SESSIONS_JOB_NAME,
  abandonStaleActivitySessions,
} from '../jobs/abandon-stale-activity-sessions'
import {
  PROCESS_CHAIN_TRANSACTIONS_JOB_NAME,
  processChainTransactions,
} from '../jobs/process-chain-transactions'
import { acquireJobLease, releaseJobLease } from '../repositories/job-leases-repository'

// A new player's mint should start within a couple of seconds of their request.
const CHAIN_TRANSACTIONS_POLL_INTERVAL_MILLISECONDS = 2_000
// Staleness is measured in half hours, so once a minute is plenty.
const ABANDON_STALE_ACTIVITY_SESSIONS_INTERVAL_MILLISECONDS = 60_000
// Longer than one outbox step (a receipt wait is capped at 20 s), renewed between steps.
const JOB_LEASE_DURATION_MILLISECONDS = 60_000

type BackgroundJob = {
  jobName: string
  intervalMilliseconds: number
  /** One run. Called only while this process holds the job's lease. */
  runOnce: (context: {
    renewJobLease: () => Promise<boolean>
    log: FastifyBaseLogger
  }) => Promise<void>
}

/**
 * Runs each job in `jobs/` on its interval, in whichever API process holds that
 * job's lease (D-019). Doesn't start under `NODE_ENV=test`: tests call the jobs directly.
 */
export const backgroundJobsPlugin = fastifyPlugin(
  async (fastify) => {
    if (fastify.config.nodeEnvironment === 'test') return

    const { database } = fastify.mongo
    const backgroundJobs: BackgroundJob[] = [
      {
        jobName: PROCESS_CHAIN_TRANSACTIONS_JOB_NAME,
        intervalMilliseconds: CHAIN_TRANSACTIONS_POLL_INTERVAL_MILLISECONDS,
        runOnce: ({ renewJobLease, log }) =>
          processChainTransactions({
            database,
            chainClients: fastify.chain,
            contractAddresses: fastify.config.contractAddresses,
            renewJobLease,
            log,
          }),
      },
      {
        jobName: ABANDON_STALE_ACTIVITY_SESSIONS_JOB_NAME,
        intervalMilliseconds: ABANDON_STALE_ACTIVITY_SESSIONS_INTERVAL_MILLISECONDS,
        runOnce: ({ log }) => abandonStaleActivitySessions({ database, now: new Date(), log }),
      },
    ]

    // Stable across restarts: a process killed without a clean shutdown (a crash,
    // or `bun --watch` reloading) never releases its lease, and its replacement on
    // the same host and port takes it straight back instead of waiting it out.
    // Two live processes can't share a host and port, so holders stay distinct.
    const holderId = `${hostname()}:${fastify.config.apiPort}`

    const repeatingJobs = backgroundJobs.map(({ jobName, intervalMilliseconds, runOnce }) => {
      const log = fastify.log.child({ job: jobName })
      const renewJobLease = () =>
        acquireJobLease(database, {
          jobName,
          holderId,
          leaseDurationMilliseconds: JOB_LEASE_DURATION_MILLISECONDS,
          now: new Date(),
        })
      return createRepeatingJob({
        intervalMilliseconds,
        runOnce: async () => {
          if (!(await renewJobLease())) return
          await runOnce({ renewJobLease, log })
        },
        onError: (error) => log.error({ err: error }, 'Background job run failed'),
      })
    })

    fastify.addHook('onReady', async () => {
      for (const repeatingJob of repeatingJobs) repeatingJob.start()
    })
    // preClose, not onClose: the jobs need Mongo, which closes in its own onClose.
    fastify.addHook('preClose', async () => {
      await Promise.all(repeatingJobs.map((repeatingJob) => repeatingJob.stop()))
      await Promise.all(
        backgroundJobs.map(({ jobName }) => releaseJobLease(database, { jobName, holderId })),
      )
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
