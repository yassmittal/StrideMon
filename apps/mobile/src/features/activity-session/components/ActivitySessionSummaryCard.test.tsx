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
}

describe('ActivitySessionSummaryCard', () => {
  it('shows the validated minutes, distance and average speed', async () => {
    await render(<ActivitySessionSummaryCard activitySession={SETTLING_ACTIVITY_SESSION} />)

    expect(screen.getByText('Run validated')).toBeTruthy()
    expect(screen.getByLabelText('Active minutes: 10')).toBeTruthy()
    expect(screen.getByLabelText('Distance: 842 m')).toBeTruthy()
    expect(screen.getByLabelText('Average speed: 5.1 km/h')).toBeTruthy()
  })

  it('explains each warning the validator raised', async () => {
    await render(
      <ActivitySessionSummaryCard
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

  it('explains which minutes count when none of the run did', async () => {
    await render(
      <ActivitySessionSummaryCard
        activitySession={{
          ...SETTLING_ACTIVITY_SESSION,
          validationResult: {
            ...SETTLING_ACTIVITY_SESSION.validationResult!,
            activeMinutes: 0,
            distanceMeters: 0,
          },
        }}
      />,
    )

    expect(screen.getByText(/whole minute of moving at 1–20/)).toBeTruthy()
  })

  it('says a run with a simulated location didn’t count', async () => {
    await render(
      <ActivitySessionSummaryCard
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
