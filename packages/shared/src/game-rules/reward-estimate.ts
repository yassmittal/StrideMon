import type { GameConfig } from './game-config'

const BASIS_POINTS_DENOMINATOR = 10_000
const SECONDS_PER_MINUTE = 60

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

/**
 * SOLE the run in progress would earn if every elapsed whole minute counted, capped
 * by energy like settlement. An **estimate** for the live run screen: only the API's
 * validation and the contract decide the real reward.
 */
export function estimateLiveReward({
  elapsedActiveSeconds,
  efficiency,
  currentEnergy,
  gameConfig,
}: {
  elapsedActiveSeconds: number
  efficiency: number
  currentEnergy: number
  gameConfig: GameConfig
}): bigint {
  const elapsedWholeMinutes = Math.floor(Math.max(0, elapsedActiveSeconds) / SECONDS_PER_MINUTE)
  const rewardedMinutes = calculateRewardedMinutes({
    activeMinutes: elapsedWholeMinutes,
    currentEnergy,
  })
  return calculateSessionReward({ rewardedMinutes, efficiency, gameConfig })
}
