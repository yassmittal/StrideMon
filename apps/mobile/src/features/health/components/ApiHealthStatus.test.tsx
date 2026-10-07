import { fireEvent, render, screen } from '@testing-library/react-native'
import { ApiError } from '../../../lib/api-client'
import { ApiHealthStatus } from './ApiHealthStatus'

const noop = () => {}

describe('ApiHealthStatus', () => {
  it('shows nothing while the API answers', async () => {
    await render(<ApiHealthStatus error={null} isRefetching={false} onRetryPress={noop} />)

    expect(screen.toJSON()).toBeNull()
  })

  it('explains a network failure and lets the player retry', async () => {
    const handleRetryPress = jest.fn()
    await render(
      <ApiHealthStatus
        error={new ApiError({ code: 'NETWORK_UNREACHABLE', message: 'offline', statusCode: null })}
        isRefetching={false}
        onRetryPress={handleRetryPress}
      />,
    )

    // Jest runs as a dev build, so the LAN IP hint shows.
    expect(screen.getByText(/LAN IP/)).toBeTruthy()
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }))
    expect(handleRetryPress).toHaveBeenCalledTimes(1)
  })
})
