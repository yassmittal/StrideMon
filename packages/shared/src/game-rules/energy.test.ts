import { describe, expect, it } from 'bun:test'
import { calculateCurrentEnergy, calculateEnergyAfterSpending } from './energy'
import { FIXTURE_GAME_CONFIG, gameRuleFixtures } from './game-rule-fixtures.test-support'

describe('energy (shared fixtures)', () => {
  for (const fixture of gameRuleFixtures.energy) {
    it(fixture.name, () => {
      const energyInput = {
        storedEnergy: fixture.input.storedEnergy,
        energyUpdatedAt: BigInt(fixture.input.energyUpdatedAt),
        currentTimestampSeconds: BigInt(fixture.input.currentTimestamp),
        gameConfig: FIXTURE_GAME_CONFIG,
      }

      const currentEnergy = calculateCurrentEnergy(energyInput)
      const energyAfterSpending = calculateEnergyAfterSpending({
        ...energyInput,
        energySpent: fixture.input.energySpent,
      })

      expect(currentEnergy).toBe(fixture.expect.currentEnergy)
      expect(energyAfterSpending).toEqual({
        storedEnergy: fixture.expect.storedEnergyAfterSpending,
        energyUpdatedAt: BigInt(fixture.expect.energyUpdatedAtAfterSpending),
      })
    })
  }
})

describe('energy (estimate-only behavior)', () => {
  it('treats a device clock behind chain time as no regeneration', () => {
    const currentEnergy = calculateCurrentEnergy({
      storedEnergy: 3,
      energyUpdatedAt: 1_790_000_000n,
      currentTimestampSeconds: 1_789_999_000n,
      gameConfig: FIXTURE_GAME_CONFIG,
    })

    expect(currentEnergy).toBe(3)
  })

  it('refuses to spend more energy than is available', () => {
    expect(() =>
      calculateEnergyAfterSpending({
        storedEnergy: 2,
        energyUpdatedAt: 1_790_000_000n,
        currentTimestampSeconds: 1_790_000_000n,
        energySpent: 3,
        gameConfig: FIXTURE_GAME_CONFIG,
      }),
    ).toThrow(RangeError)
  })
})
