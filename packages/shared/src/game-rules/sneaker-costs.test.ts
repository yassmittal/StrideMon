import { describe, expect, it } from 'bun:test'
import { FIXTURE_GAME_CONFIG, gameRuleFixtures } from './game-rule-fixtures.test-support'
import { calculateRepairCost, calculateUpgradeCost } from './sneaker-costs'

describe('repair cost (shared fixtures)', () => {
  for (const fixture of gameRuleFixtures.repair) {
    it(fixture.name, () => {
      const repairCostWei = calculateRepairCost({
        level: fixture.input.level,
        durability: fixture.input.durability,
        gameConfig: FIXTURE_GAME_CONFIG,
      })

      expect(repairCostWei).toBe(BigInt(fixture.expect.repairCostWei))
    })
  }
})

describe('upgrade cost (shared fixtures)', () => {
  for (const fixture of gameRuleFixtures.upgrade) {
    it(fixture.name, () => {
      const upgradeCostWei = calculateUpgradeCost({
        level: fixture.input.level,
        gameConfig: FIXTURE_GAME_CONFIG,
      })

      expect(upgradeCostWei).toBe(BigInt(fixture.expect.upgradeCostWei))
    })
  }
})
