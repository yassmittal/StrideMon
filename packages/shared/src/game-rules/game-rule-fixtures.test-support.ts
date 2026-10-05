import type { GameConfig } from './game-config'
import gameRuleFixtures from './game-rule-fixtures.json'

/** The fixture file's `gameConfig`, with wei strings turned into bigints. */
export const FIXTURE_GAME_CONFIG: GameConfig = {
  ...gameRuleFixtures.gameConfig,
  rewardPerEfficiencyMinuteWei: BigInt(gameRuleFixtures.gameConfig.rewardPerEfficiencyMinuteWei),
  repairCostPerPointWei: BigInt(gameRuleFixtures.gameConfig.repairCostPerPointWei),
  repairCostPerPointIncreasePerLevelWei: BigInt(
    gameRuleFixtures.gameConfig.repairCostPerPointIncreasePerLevelWei,
  ),
  upgradeCostPerLevelWei: BigInt(gameRuleFixtures.gameConfig.upgradeCostPerLevelWei),
}

export { gameRuleFixtures }
