import {
  describeSneakerActionBlockedReason,
  findUpgradeBlockedReason,
} from '../sneaker-action-availability'
import type { SneakerActionCost } from '../sneaker-action-cost'
import type { SneakerGameTransactionState } from '../sneaker-game-transaction-state'
import { SneakerActionPanel } from './SneakerActionPanel'

type UpgradePanelProps = {
  isGamePaused: boolean
  level: number
  maxLevel: number
  efficiency: number
  efficiencyGainPerLevel: number
  upgradeCost: SneakerActionCost
  rewardBalanceWei: bigint
  transactionState: SneakerGameTransactionState
  onConfirmPress: () => void
  onTransactionReset: () => void
}

/** Spend STRIDE to go up a level: more efficiency, so every rewarded minute earns more. */
export function UpgradePanel({
  isGamePaused,
  level,
  maxLevel,
  efficiency,
  efficiencyGainPerLevel,
  upgradeCost,
  rewardBalanceWei,
  ...transactionProps
}: UpgradePanelProps) {
  const upgradeCostWei = upgradeCost.status === 'ready' ? upgradeCost.costWei : undefined
  const isAtMaxLevel = level >= maxLevel
  const blockedReason =
    upgradeCost.status === 'ready'
      ? findUpgradeBlockedReason({
          isGamePaused,
          level,
          maxLevel,
          upgradeCostWei,
          rewardBalanceWei,
        })
      : null
  const nextLevel = level + 1

  return (
    <SneakerActionPanel
      title="Upgrade"
      description="Higher efficiency earns more STRIDE for every rewarded minute."
      actionLabel={isAtMaxLevel ? 'Upgrade' : `Upgrade to level ${nextLevel}`}
      statChanges={
        isAtMaxLevel
          ? []
          : [
              { label: 'Level', valueBefore: String(level), valueAfter: String(nextLevel) },
              {
                label: 'Efficiency',
                valueBefore: String(efficiency),
                valueAfter: String(efficiency + efficiencyGainPerLevel),
              },
            ]
      }
      cost={upgradeCost}
      rewardBalanceWei={rewardBalanceWei}
      blockedReasonMessage={
        blockedReason === null
          ? null
          : describeSneakerActionBlockedReason({
              blockedReason,
              costWei: upgradeCostWei,
              rewardBalanceWei,
            })
      }
      confirmationTitle={`Upgrade to level ${nextLevel}?`}
      successTitle={`Level ${nextLevel} reached`}
      {...transactionProps}
    />
  )
}
