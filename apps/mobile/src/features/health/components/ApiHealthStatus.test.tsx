import { fireEvent, render, screen } from '@testing-library/react-native'
import { ApiError } from '../../../lib/api-client'
import { ApiHealthStatus } from './ApiHealthStatus'

const noop = () => {}

describe('ApiHealthStatus', () => {
  it('shows a loading state while the first check runs', async () => {
    await render(
      <ApiHealthStatus
        health={undefined}
        error={null}
        isLoading
        isRefetching={false}
        onRetryPress={noop}
      />,
    )

    expect(screen.getByText('Checking the API…')).toBeTruthy()
  })

  it('shows the API and Mongo status when the API answers', async () => {
    await render(
      <ApiHealthStatus
        health={{ status: 'ok', mongo: 'connected' }}
        error={null}
        isLoading={false}
        isRefetching={false}
        onRetryPress={noop}
      />,
    )

    expect(screen.getByText('API: ok')).toBeTruthy()
    expect(screen.getByText('MongoDB: connected')).toBeTruthy()
  })

  it('explains a network failure and lets the user retry', async () => {
    const handleRetryPress = jest.fn()
    await render(
      <ApiHealthStatus
        health={undefined}
        error={new ApiError({ code: 'NETWORK_UNREACHABLE', message: 'offline', statusCode: null })}
        isLoading={false}
        isRefetching={false}
        onRetryPress={handleRetryPress}
      />,
    )

    expect(screen.getByText('API: unreachable')).toBeTruthy()
    expect(screen.getByText(/LAN IP/)).toBeTruthy()
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }))
    expect(handleRetryPress).toHaveBeenCalledTimes(1)
  })
})
