import { render, screen } from '@testing-library/react-native'
import { RepairPanel } from './RepairPanel'

const SOLE_WEI = 10n ** 18n
const noop = () => {}

describe('RepairPanel', () => {
  it('shows the quoted cost and durability back to full', async () => {
    await render(
      <RepairPanel
        isGamePaused={false}
        durability={72}
        maxDurability={100}
        repairCost={{ status: 'ready', costWei: 196n * 10n ** 17n }}
        rewardBalanceWei={45n * SOLE_WEI}
        transactionState={{ phase: 'idle' }}
        onConfirmPress={noop}
        onTransactionReset={noop}
      />,
    )

    expect(screen.getByText('19.6 SOLE')).toBeTruthy()
    expect(screen.getByLabelText('Durability: 72 to 100')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Repair to 100' })).toBeEnabled()
  })

  it('is disabled at full durability', async () => {
    await render(
      <RepairPanel
        isGamePaused={false}
        durability={100}
        maxDurability={100}
        repairCost={{ status: 'ready', costWei: 0n }}
        rewardBalanceWei={45n * SOLE_WEI}
        transactionState={{ phase: 'idle' }}
        onConfirmPress={noop}
        onTransactionReset={noop}
      />,
    )

    expect(screen.getByRole('button', { name: 'Repair' })).toBeDisabled()
    expect(screen.getByText('Already at full durability.')).toBeTruthy()
  })
})
