import { render, screen } from '@testing-library/react-native'
import { LiveRunStats } from './LiveRunStats'

const LIVE_RUN_STATS = {
  elapsedSeconds: 185,
  distanceMeters: 262,
  currentSpeedKilometersPerHour: 5.04,
  estimatedEnergyLeft: 7,
  estimatedRewardWei: 15n * 10n ** 18n,
  recordedSampleCount: 60,
}

describe('LiveRunStats', () => {
  it('shows time, distance, speed and the estimated energy and reward', async () => {
    await render(
      <LiveRunStats
        liveRunStats={LIVE_RUN_STATS}
        energyAtStart={10}
        unsentSampleCount={0}
        uploadErrorCode={null}
      />,
    )

    expect(screen.getByLabelText('Time: 3:05')).toBeTruthy()
    expect(screen.getByLabelText('Distance: 262 m')).toBeTruthy()
    expect(screen.getByLabelText('Speed: 5.0 km/h')).toBeTruthy()
    expect(
      screen.getByRole('progressbar', { name: 'Energy left (estimated)' }).props.accessibilityValue,
    ).toMatchObject({ now: 7, max: 10 })
    expect(screen.getByLabelText('Reward (estimated): +15 STRIDE')).toBeTruthy()
  })

  it('waits for GPS before the first fix', async () => {
    await render(
      <LiveRunStats
        liveRunStats={{
          ...LIVE_RUN_STATS,
          recordedSampleCount: 0,
          currentSpeedKilometersPerHour: null,
        }}
        energyAtStart={10}
        unsentSampleCount={0}
        uploadErrorCode={null}
      />,
    )

    expect(screen.getByText(/Waiting for GPS/)).toBeTruthy()
    expect(screen.getByLabelText('Speed: —')).toBeTruthy()
  })

  it('reassures that samples are kept when an upload fails', async () => {
    await render(
      <LiveRunStats
        liveRunStats={LIVE_RUN_STATS}
        energyAtStart={10}
        unsentSampleCount={12}
        uploadErrorCode="NETWORK_UNREACHABLE"
      />,
    )

    expect(screen.getByText(/Couldn’t upload 12 yet; they’re saved on this phone/)).toBeTruthy()
  })
})
