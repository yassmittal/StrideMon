import type { ActivitySession } from '@stridemon/shared/api-contracts'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { ActivitySessionHistoryList } from './ActivitySessionHistoryList'

const SETTLED_ACTIVITY_SESSION: ActivitySession = {
  activitySessionId: '66f9c0ffee00000000000001',
  sneakerTokenId: '7',
  status: 'settled',
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
  settlement: {
    transactionHash: `0x${'ab'.repeat(32)}`,
    rewardAmountWei: '50000000000000000000',
    durabilityLoss: 3,
    rewardedMinutes: 10,
    settledAt: '2026-09-29T06:11:03.000Z',
  },
}

function renderHistoryList(
  activitySessions: readonly ActivitySession[],
  onActivitySessionPress = jest.fn(),
) {
  return render(
    <ActivitySessionHistoryList
      activitySessions={activitySessions}
      onActivitySessionPress={onActivitySessionPress}
      onEndReached={jest.fn()}
      isLoadingMore={false}
      onRefresh={jest.fn()}
      isRefreshing={false}
    />,
  )
}

describe('ActivitySessionHistoryList', () => {
  it('shows a settled run with its duration, distance, reward and status', async () => {
    await renderHistoryList([SETTLED_ACTIVITY_SESSION])

    expect(screen.getByText('11:00  •  842 m')).toBeTruthy()
    expect(screen.getByText('+50 STRIDE')).toBeTruthy()
    expect(screen.getByText('Settled')).toBeTruthy()
  })

  it('badges a rejected run and shows no reward', async () => {
    await renderHistoryList([
      {
        ...SETTLED_ACTIVITY_SESSION,
        status: 'rejected',
        validationResult: null,
        rejectionReason: 'INSUFFICIENT_ACTIVITY_DATA',
        settlement: null,
      },
    ])

    expect(screen.getByText('Didn’t count')).toBeTruthy()
    expect(screen.queryByText(/STRIDE/)).toBeNull()
  })

  it('opens the run that was pressed', async () => {
    const onActivitySessionPress = jest.fn()
    await renderHistoryList([SETTLED_ACTIVITY_SESSION], onActivitySessionPress)

    await fireEvent.press(screen.getByRole('button'))

    expect(onActivitySessionPress).toHaveBeenCalledWith(SETTLED_ACTIVITY_SESSION.activitySessionId)
  })

  it('invites a first run when there are none', async () => {
    await renderHistoryList([])

    expect(screen.getByText('No runs yet')).toBeTruthy()
  })
})
