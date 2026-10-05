import { fireEvent, render, screen } from '@testing-library/react-native'
import { RewardBalanceCard } from './RewardBalanceCard'

const noop = () => {}

describe('RewardBalanceCard', () => {
  it('shows a new player’s balance as 0 SOLE', async () => {
    await render(
      <RewardBalanceCard
        rewardBalanceWei={0n}
        isLoading={false}
        isError={false}
        onRetryPress={noop}
      />,
    )

    expect(screen.getByLabelText('SOLE balance: 0 SOLE')).toBeTruthy()
  })

  it('formats earned SOLE from wei', async () => {
    await render(
      <RewardBalanceCard
        rewardBalanceWei={12_500_000_000_000_000_000n}
        isLoading={false}
        isError={false}
        onRetryPress={noop}
      />,
    )

    expect(screen.getByLabelText('SOLE balance: 12.5 SOLE')).toBeTruthy()
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
