import {
  describeSneakerActionBlockedReason,
  findRepairBlockedReason,
} from '../sneaker-action-availability'
import type { SneakerActionCost } from '../sneaker-action-cost'
import type { SneakerGameTransactionState } from '../sneaker-game-transaction-state'
import { SneakerActionPanel } from './SneakerActionPanel'

type RepairPanelProps = {
  isGamePaused: boolean
  durability: number
  maxDurability: number
  repairCost: SneakerActionCost
  rewardBalanceWei: bigint
  transactionState: SneakerGameTransactionState
  onConfirmPress: () => void
  onTransactionReset: () => void
}

/** Spend SOLE to restore durability to full. */
export function RepairPanel({
  isGamePaused,
  durability,
  maxDurability,
  repairCost,
  rewardBalanceWei,
  ...transactionProps
}: RepairPanelProps) {
  const repairCostWei = repairCost.status === 'ready' ? repairCost.costWei : undefined
  const blockedReason =
    repairCostWei === undefined
      ? null
      : findRepairBlockedReason({
          isGamePaused,
          durability,
          maxDurability,
          repairCostWei,
          rewardBalanceWei,
        })
  const isWornDown = durability < maxDurability

  return (
    <SneakerActionPanel
      title="Repair"
      description="Every run wears your Sneaker down. At zero durability it can’t run until it’s repaired."
      actionLabel={isWornDown ? `Repair to ${maxDurability}` : 'Repair'}
      statChanges={
        isWornDown
          ? [
              {
                label: 'Durability',
                valueBefore: String(durability),
                valueAfter: String(maxDurability),
              },
            ]
          : []
      }
      cost={repairCost}
      rewardBalanceWei={rewardBalanceWei}
      blockedReasonMessage={
        blockedReason === null
          ? null
          : describeSneakerActionBlockedReason({
              blockedReason,
              costWei: repairCostWei,
              rewardBalanceWei,
            })
      }
      confirmationTitle="Repair your Sneaker?"
      successTitle="Sneaker repaired"
      {...transactionProps}
    />
  )
}
