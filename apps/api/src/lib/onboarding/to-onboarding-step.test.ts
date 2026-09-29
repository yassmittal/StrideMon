import { describe, expect, it } from 'bun:test'
import { toOnboardingStep } from './to-onboarding-step'

const TRANSACTION_HASH = `0x${'ab'.repeat(32)}`

describe('toOnboardingStep', () => {
  it('reports notStarted when nothing was enqueued', () => {
    expect(toOnboardingStep(null)).toEqual({ status: 'notStarted', transactionHash: null })
  })

  it('reports a queued transaction as pending, with no hash yet', () => {
    expect(toOnboardingStep({ status: 'queued', transactionHash: null })).toEqual({
      status: 'pending',
      transactionHash: null,
    })
  })

  it('reports a submitted transaction as pending, with its hash for the explorer link', () => {
    expect(toOnboardingStep({ status: 'submitted', transactionHash: TRANSACTION_HASH })).toEqual({
      status: 'pending',
      transactionHash: TRANSACTION_HASH,
    })
  })

  it('passes confirmed and failed through', () => {
    expect(
      toOnboardingStep({ status: 'confirmed', transactionHash: TRANSACTION_HASH }).status,
    ).toBe('confirmed')
    expect(toOnboardingStep({ status: 'failed', transactionHash: null }).status).toBe('failed')
  })
})
