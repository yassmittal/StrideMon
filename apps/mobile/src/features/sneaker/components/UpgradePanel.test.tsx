import { fireEvent, render, screen } from '@testing-library/react-native'
import type { SneakerGameTransactionState } from '../sneaker-game-transaction-state'
import { UpgradePanel } from './UpgradePanel'

const STRIDE_WEI = 10n ** 18n
const noop = () => {}

function renderUpgradePanel({
  level = 1,
  rewardBalanceWei = 60n * STRIDE_WEI,
  transactionState = { phase: 'idle' },
  onConfirmPress = noop,
}: {
  level?: number
  rewardBalanceWei?: bigint
  transactionState?: SneakerGameTransactionState
  onConfirmPress?: () => void
} = {}) {
  return render(
    <UpgradePanel
      isGamePaused={false}
      level={level}
      maxLevel={30}
      efficiency={10}
      efficiencyGainPerLevel={2}
      upgradeCost={{ status: 'ready', costWei: level >= 30 ? undefined : 50n * STRIDE_WEI }}
      rewardBalanceWei={rewardBalanceWei}
      transactionState={transactionState}
      onConfirmPress={onConfirmPress}
      onTransactionReset={noop}
    />,
  )
}

describe('UpgradePanel', () => {
  it('shows the cost and the stats after the upgrade', async () => {
    await renderUpgradePanel()

    expect(screen.getByText('50 STRIDE')).toBeTruthy()
    expect(screen.getByLabelText('Level: 1 to 2')).toBeTruthy()
    expect(screen.getByLabelText('Efficiency: 10 to 12')).toBeTruthy()
  })

  it('confirms in a sheet before the wallet opens', async () => {
    const handleConfirmPress = jest.fn()
    await renderUpgradePanel({ onConfirmPress: handleConfirmPress })

    await fireEvent.press(screen.getByRole('button', { name: 'Upgrade to level 2' }))
    expect(screen.getByLabelText('STRIDE balance: 60 to 10')).toBeTruthy()
    await fireEvent.press(screen.getByRole('button', { name: 'Confirm in wallet' }))

    expect(handleConfirmPress).toHaveBeenCalledTimes(1)
  })

  it('is disabled with a reason when the STRIDE balance is short', async () => {
    await renderUpgradePanel({ rewardBalanceWei: 45n * STRIDE_WEI })

    expect(screen.getByRole('button', { name: 'Upgrade to level 2' })).toBeDisabled()
    expect(
      screen.getByText(
        'Not enough rewards. You need 50 STRIDE and have 45 STRIDE. Walk to earn more.',
      ),
    ).toBeTruthy()
  })

  it('is disabled at max level', async () => {
    await renderUpgradePanel({ level: 30 })

    expect(screen.getByRole('button', { name: 'Upgrade' })).toBeDisabled()
    expect(screen.getByText('Max level. This Sneaker can’t go any higher.')).toBeTruthy()
  })
})
