import { fireEvent, render, screen } from '@testing-library/react-native'
import { RewardBalanceCard } from './RewardBalanceCard'

const noop = () => {}

describe('RewardBalanceCard', () => {
  it('shows a new player’s balance as 0 STRIDE', async () => {
    await render(
      <RewardBalanceCard
        rewardBalanceWei={0n}
        isLoading={false}
        isError={false}
        onRetryPress={noop}
      />,
    )

    expect(screen.getByLabelText('STRIDE balance: 0 STRIDE')).toBeTruthy()
  })

  it('formats earned STRIDE from wei', async () => {
    await render(
      <RewardBalanceCard
        rewardBalanceWei={12_500_000_000_000_000_000n}
        isLoading={false}
        isError={false}
        onRetryPress={noop}
      />,
    )

    expect(screen.getByLabelText('STRIDE balance: 12.5 STRIDE')).toBeTruthy()
  })

  it('offers a retry when the balance can’t be read', async () => {
    const handleRetryPress = jest.fn()
    await render(
      <RewardBalanceCard
        rewardBalanceWei={undefined}
        isLoading={false}
        isError
        onRetryPress={handleRetryPress}
      />,
    )

    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }))
    expect(handleRetryPress).toHaveBeenCalledTimes(1)
  })
})
