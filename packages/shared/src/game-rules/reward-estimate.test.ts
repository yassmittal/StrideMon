import { describe, expect, it } from 'bun:test'
import { FIXTURE_GAME_CONFIG, gameRuleFixtures } from './game-rule-fixtures.test-support'
import {
  calculateDurabilityLoss,
  calculateRewardedMinutes,
  calculateSessionReward,
  estimateLiveReward,
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

describe('estimateLiveReward', () => {
  it('matches the MVP example after 10 minutes at efficiency 10: 50 STRIDE', () => {
    const rewardAmountWei = estimateLiveReward({
      elapsedActiveSeconds: 600,
      efficiency: 10,
      currentEnergy: 10,
      gameConfig: FIXTURE_GAME_CONFIG,
    })

    expect(rewardAmountWei).toBe(50n * 10n ** 18n)
  })

  it('counts whole minutes only, so 59 seconds earn nothing yet', () => {
    const rewardAmountWei = estimateLiveReward({
      elapsedActiveSeconds: 59,
      efficiency: 10,
      currentEnergy: 10,
      gameConfig: FIXTURE_GAME_CONFIG,
    })

    expect(rewardAmountWei).toBe(0n)
  })

  it('stops growing once the minutes reach the energy the run started with', () => {
    const rewardAmountWei = estimateLiveReward({
      elapsedActiveSeconds: 25 * 60,
      efficiency: 10,
      currentEnergy: 4,
      gameConfig: FIXTURE_GAME_CONFIG,
    })

    expect(rewardAmountWei).toBe(20n * 10n ** 18n)
  })
})
