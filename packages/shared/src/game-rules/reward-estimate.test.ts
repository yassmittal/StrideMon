import { describe, expect, it } from 'bun:test'
import { FIXTURE_GAME_CONFIG, gameRuleFixtures } from './game-rule-fixtures.test-support'
import {
  calculateDurabilityLoss,
  calculateRewardedMinutes,
  calculateSessionReward,
} from './reward-estimate'

describe('session reward (shared fixtures)', () => {
  for (const fixture of gameRuleFixtures.session) {
    it(fixture.name, () => {
      const rewardedMinutes = calculateRewardedMinutes({
        activeMinutes: fixture.input.activeMinutes,
        currentEnergy: fixture.input.currentEnergy,
      })
      const rewardAmountWei = calculateSessionReward({
        rewardedMinutes,
        efficiency: fixture.input.efficiency,
        gameConfig: FIXTURE_GAME_CONFIG,
      })
      const durabilityLoss = calculateDurabilityLoss({
        rewardedMinutes,
        durability: fixture.input.durability,
        gameConfig: FIXTURE_GAME_CONFIG,
      })

      expect(rewardedMinutes).toBe(fixture.expect.rewardedMinutes)
      expect(rewardAmountWei).toBe(BigInt(fixture.expect.rewardAmountWei))
      expect(durabilityLoss).toBe(fixture.expect.durabilityLoss)
    })
  }
})
