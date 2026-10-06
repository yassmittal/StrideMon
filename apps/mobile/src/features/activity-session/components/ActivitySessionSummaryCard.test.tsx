import type { ActivitySession } from '@stridemon/shared/api-contracts'
import { render, screen } from '@testing-library/react-native'
import { ActivitySessionSummaryCard } from './ActivitySessionSummaryCard'

const SETTLING_ACTIVITY_SESSION: ActivitySession = {
  activitySessionId: '66f9c0ffee00000000000001',
  sneakerTokenId: '7',
  status: 'settling',
  startedAt: '2026-09-29T06:00:00.000Z',
  finishedAt: '2026-09-29T06:11:00.000Z',
  energyAtStart: 10,
  validationResult: {
    activeMinutes: 10,
    distanceMeters: 842,
    averageSpeedKilometersPerHour: 5.08,
    rejectedSampleCount: 0,
    warnings: [],
  },
  rejectionReason: null,
  settlement: null,
}

const SETTLED_ACTIVITY_SESSION: ActivitySession = {
  ...SETTLING_ACTIVITY_SESSION,
  status: 'settled',
  settlement: {
    transactionHash: `0x${'ab'.repeat(32)}`,
    rewardAmountWei: '50000000000000000000',
    durabilityLoss: 3,
    rewardedMinutes: 10,
    settledAt: '2026-09-29T06:11:03.000Z',
  },
}

describe('ActivitySessionSummaryCard', () => {
  it('says it’s settling on Monad, above the validated numbers', async () => {
    await render(
      <ActivitySessionSummaryCard
        isGamePaused={false}
        activitySession={SETTLING_ACTIVITY_SESSION}
      />,
    )

    expect(screen.getByText('Settling on Monad…')).toBeTruthy()
    expect(screen.getByLabelText('Duration: 11:00')).toBeTruthy()
    expect(screen.getByLabelText('Active minutes: 10')).toBeTruthy()
    expect(screen.getByLabelText('Distance: 842 m')).toBeTruthy()
    expect(screen.getByLabelText('Average speed: 5.1 km/h')).toBeTruthy()
  })

  it('shows the STRIDE earned, the durability lost and a link to the transaction', async () => {
    await render(
      <ActivitySessionSummaryCard
        isGamePaused={false}
        activitySession={SETTLED_ACTIVITY_SESSION}
      />,
    )

    expect(screen.getByLabelText('You earned +50 STRIDE')).toBeTruthy()
    expect(screen.getByLabelText('Durability lost: −3')).toBeTruthy()
    expect(screen.getByRole('link', { name: /settlement transaction/ })).toBeTruthy()
  })

  it('explains when energy capped the rewarded minutes', async () => {
    await render(
      <ActivitySessionSummaryCard
        isGamePaused={false}
        activitySession={{
          ...SETTLED_ACTIVITY_SESSION,
          settlement: {
            ...SETTLED_ACTIVITY_SESSION.settlement!,
            rewardAmountWei: '20000000000000000000',
            rewardedMinutes: 4,
          },
        }}
      />,
    )

    expect(screen.getByLabelText('You earned +20 STRIDE')).toBeTruthy()
    expect(screen.getByText(/energy for 4 of your 10 active minutes/)).toBeTruthy()
  })

  it('says a run whose Sneaker changed owner didn’t count', async () => {
    await render(
      <ActivitySessionSummaryCard
        isGamePaused={false}
        activitySession={{
          ...SETTLING_ACTIVITY_SESSION,
          status: 'rejected',
          rejectionReason: 'SNEAKER_TRANSFERRED_DURING_SESSION',
        }}
      />,
    )

    expect(screen.getByText(/changed owner/)).toBeTruthy()
  })

  it('explains each warning the validator raised', async () => {
    await render(
      <ActivitySessionSummaryCard
        isGamePaused={false}
        activitySession={{
          ...SETTLING_ACTIVITY_SESSION,
          validationResult: {
            ...SETTLING_ACTIVITY_SESSION.validationResult!,
            warnings: ['lowGpsAccuracy', 'vehicleSpeedDetected'],
          },
        }}
      />,
    )

    expect(screen.getByText(/too imprecise/)).toBeTruthy()
    expect(screen.getByText(/looks like a vehicle/)).toBeTruthy()
  })

  it('says a run with no full minute earned nothing, without showing 0 m and 0 km/h', async () => {
    await render(
      <ActivitySessionSummaryCard
        isGamePaused={false}
        activitySession={{
          ...SETTLED_ACTIVITY_SESSION,
          finishedAt: '2026-09-29T06:01:03.000Z',
          validationResult: {
            ...SETTLED_ACTIVITY_SESSION.validationResult!,
            activeMinutes: 0,
            distanceMeters: 0,
            averageSpeedKilometersPerHour: 0,
          },
          settlement: {
            transactionHash: null,
            rewardAmountWei: '0',
            durabilityLoss: 0,
            rewardedMinutes: 0,
            settledAt: '2026-09-29T06:01:03.000Z',
          },
        }}
      />,
    )

    expect(screen.getByText('No STRIDE this time')).toBeTruthy()
    expect(screen.getByText(/full minute of walking/)).toBeTruthy()
    expect(screen.getByLabelText('Duration: 1:03')).toBeTruthy()
    expect(screen.queryByLabelText(/^Distance/)).toBeNull()
    expect(screen.queryByText(/\+0 STRIDE/)).toBeNull()
  })

  it('says a run with a simulated location didn’t count', async () => {
    await render(
      <ActivitySessionSummaryCard
        isGamePaused={false}
        activitySession={{
          ...SETTLING_ACTIVITY_SESSION,
          status: 'rejected',
          validationResult: null,
          rejectionReason: 'MOCK_LOCATION_DETECTED',
        }}
      />,
    )

    expect(screen.getByText('This run didn’t count')).toBeTruthy()
    expect(screen.getByText(/simulated location/)).toBeTruthy()
  })

  it('says an abandoned run was closed', async () => {
    await render(
      <ActivitySessionSummaryCard
        isGamePaused={false}
        activitySession={{
          ...SETTLING_ACTIVITY_SESSION,
          status: 'abandoned',
          validationResult: null,
        }}
      />,
    )

    expect(screen.getByText('This run was closed')).toBeTruthy()
  })
})
