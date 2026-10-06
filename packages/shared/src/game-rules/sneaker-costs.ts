import type { GameConfig } from './game-config'

/**
 * STRIDE to restore durability to `maxDurability`, 0 when already full. The on-chain
 * `quoteRepairCost` is what the player pays. Mirrors `GameMath.calculateRepairCost`.
 */
export function calculateRepairCost({
  level,
  durability,
  gameConfig,
}: {
  level: number
  durability: number
  gameConfig: GameConfig
}): bigint {
  if (durability >= gameConfig.maxDurability) return 0n
  const missingDurability = BigInt(gameConfig.maxDurability - durability)
  const repairCostPerPointWei =
    gameConfig.repairCostPerPointWei +
    BigInt(level - 1) * gameConfig.repairCostPerPointIncreasePerLevelWei
  return missingDurability * repairCostPerPointWei
}

/**
 * STRIDE to upgrade from `level` to `level + 1`: `upgradeCostPerLevelWei × level`.
 * Mirrors `GameMath.calculateUpgradeCost`.
 */
export function calculateUpgradeCost({
  level,
  gameConfig,
}: {
  level: number
  gameConfig: GameConfig
}): bigint {
  return gameConfig.upgradeCostPerLevelWei * BigInt(level)
}
