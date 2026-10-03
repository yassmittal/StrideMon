import { formatSoleAmount } from '../../lib/format/format-sole-amount'

/** Why Repair or Upgrade is disabled. The contract enforces all three; the app explains them. */
type SneakerActionBlockedReason = 'fullDurability' | 'maxLevel' | 'notEnoughRewards'

export function findRepairBlockedReason({
  durability,
  maxDurability,
  repairCostWei,
  rewardBalanceWei,
}: {
  durability: number
  maxDurability: number
  repairCostWei: bigint
  rewardBalanceWei: bigint
}): SneakerActionBlockedReason | null {
  if (durability >= maxDurability) return 'fullDurability'
  if (rewardBalanceWei < repairCostWei) return 'notEnoughRewards'
  return null
}

export function findUpgradeBlockedReason({
  level,
  maxLevel,
  upgradeCostWei,
  rewardBalanceWei,
}: {
  level: number
  maxLevel: number
  /** `undefined` at max level, where there is no quote. */
  upgradeCostWei: bigint | undefined
  rewardBalanceWei: bigint
}): SneakerActionBlockedReason | null {
  if (level >= maxLevel || upgradeCostWei === undefined) return 'maxLevel'
  if (rewardBalanceWei < upgradeCostWei) return 'notEnoughRewards'
  return null
}

export function describeSneakerActionBlockedReason({
  blockedReason,
  costWei,
  rewardBalanceWei,
}: {
  blockedReason: SneakerActionBlockedReason
  costWei: bigint | undefined
  rewardBalanceWei: bigint
}): string {
  switch (blockedReason) {
    case 'fullDurability':
      return 'Already at full durability.'
    case 'maxLevel':
      return 'Max level. This Sneaker can’t go any higher.'
    case 'notEnoughRewards':
      return costWei === undefined
        ? 'Not enough rewards. Walk to earn more SOLE.'
        : `Not enough rewards. You need ${formatSoleAmount(costWei)} and have ${formatSoleAmount(rewardBalanceWei)}. Walk to earn more.`
    default: {
      const unhandledReason: never = blockedReason
      throw new Error(`Unhandled blocked reason: ${String(unhandledReason)}`)
    }
  }
}
