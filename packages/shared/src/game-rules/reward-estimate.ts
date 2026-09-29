import type { GameConfig } from './game-config'

const BASIS_POINTS_DENOMINATOR = 10_000

/** Active minutes capped by current energy. Mirrors `GameMath.calculateRewardedMinutes`. */
export function calculateRewardedMinutes({
  activeMinutes,
  currentEnergy,
}: {
  activeMinutes: number
  currentEnergy: number
}): number {
  return Math.min(activeMinutes, currentEnergy)
}

/**
 * SOLE earned: `rewardedMinutes × efficiency × rewardPerEfficiencyMinuteWei`.
 * Mirrors `GameMath.calculateSessionReward`.
 */
export function calculateSessionReward({
  rewardedMinutes,
  efficiency,
  gameConfig,
}: {
  rewardedMinutes: number
  efficiency: number
  gameConfig: GameConfig
}): bigint {
  return BigInt(rewardedMinutes) * BigInt(efficiency) * gameConfig.rewardPerEfficiencyMinuteWei
}

/**
 * Durability lost: `ceil(rewardedMinutes × lossBasisPoints / 10_000)`, never more than
 * the Sneaker has left. Mirrors `GameMath.calculateDurabilityLoss`.
 */
export function calculateDurabilityLoss({
  rewardedMinutes,
  durability,
  gameConfig,
}: {
  rewardedMinutes: number
  durability: number
  gameConfig: GameConfig
}): number {
  const lossTimesDenominator = rewardedMinutes * gameConfig.durabilityLossPerMinuteBasisPoints
  const uncappedLoss = Math.ceil(lossTimesDenominator / BASIS_POINTS_DENOMINATOR)
  return Math.min(uncappedLoss, durability)
}
