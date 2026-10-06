import { formatStrideAmount } from '../../lib/format/format-stride-amount'

/** Why Repair or Upgrade is disabled. The contract enforces all of them; the app explains them. */
type SneakerActionBlockedReason = 'gamePaused' | 'fullDurability' | 'maxLevel' | 'notEnoughRewards'

export function findRepairBlockedReason({
  isGamePaused,
  durability,
  maxDurability,
  repairCostWei,
  rewardBalanceWei,
}: {
  isGamePaused: boolean
  durability: number
  maxDurability: number
  repairCostWei: bigint
  rewardBalanceWei: bigint
}): SneakerActionBlockedReason | null {
  if (isGamePaused) return 'gamePaused'
  if (durability >= maxDurability) return 'fullDurability'
  if (rewardBalanceWei < repairCostWei) return 'notEnoughRewards'
  return null
}

export function findUpgradeBlockedReason({
  isGamePaused,
  level,
  maxLevel,
  upgradeCostWei,
  rewardBalanceWei,
}: {
  isGamePaused: boolean
  level: number
  maxLevel: number
  /** `undefined` at max level, where there is no quote. */
  upgradeCostWei: bigint | undefined
  rewardBalanceWei: bigint
}): SneakerActionBlockedReason | null {
  if (isGamePaused) return 'gamePaused'
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
    case 'gamePaused':
      return 'Back when maintenance ends.'
    case 'fullDurability':
      return 'Already at full durability.'
    case 'maxLevel':
      return 'Max level. This Sneaker can’t go any higher.'
    case 'notEnoughRewards':
      return costWei === undefined
        ? 'Not enough rewards. Walk to earn more STRIDE.'
        : `Not enough rewards. You need ${formatStrideAmount(costWei)} and have ${formatStrideAmount(rewardBalanceWei)}. Walk to earn more.`
    default: {
      const unhandledReason: never = blockedReason
      throw new Error(`Unhandled blocked reason: ${String(unhandledReason)}`)
    }
  }
}
