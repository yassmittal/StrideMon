import type { OnboardingStep } from '@stridemon/shared/api-contracts'
import type { ChainTransactionStatus } from '@stridemon/shared/domain'

type OutboxRecordSummary = {
  status: ChainTransactionStatus
  transactionHash: string | null
}

/** What the app shows for one onboarding step, given its outbox record (or none yet). */
export function toOnboardingStep(outboxRecord: OutboxRecordSummary | null): OnboardingStep {
  if (outboxRecord === null) return { status: 'notStarted', transactionHash: null }
  return {
    status: toOnboardingStepStatus(outboxRecord.status),
    transactionHash: outboxRecord.transactionHash,
  }
}

function toOnboardingStepStatus(status: ChainTransactionStatus): OnboardingStep['status'] {
  switch (status) {
    case 'queued':
    case 'submitted':
      return 'pending'
    case 'confirmed':
      return 'confirmed'
    case 'failed':
      return 'failed'
    default: {
      const unhandledStatus: never = status
      throw new Error(`Unhandled chain transaction status: ${String(unhandledStatus)}`)
    }
  }
}
