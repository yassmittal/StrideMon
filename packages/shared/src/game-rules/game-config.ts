/**
 * Mirror of `SneakerGame.getGameConfig()`. Field types match what viem returns for
 * the Solidity struct: `uint16`/`uint32` become `number`, `uint256` becomes `bigint`.
 */
export type GameConfig = {
  maxLevel: number
  maxEnergy: number
  maxDurability: number
  starterEfficiency: number
  efficiencyGainPerLevel: number
  durabilityLossPerMinuteBasisPoints: number
  energyRegenerationSeconds: number
  rewardPerEfficiencyMinuteWei: bigint
  repairCostPerPointWei: bigint
  repairCostPerPointIncreasePerLevelWei: bigint
  upgradeCostPerLevelWei: bigint
}
