import { describe, expect, it } from 'bun:test'
import {
  calculateCurrentEnergy,
  calculateEnergyAfterSpending,
  calculateSecondsUntilNextEnergyPoint,
} from './energy'
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

describe('calculateSecondsUntilNextEnergyPoint', () => {
  const ENERGY_UPDATED_AT = 1_790_000_000n

  it('returns null when energy is full', () => {
    const secondsUntilNextPoint = calculateSecondsUntilNextEnergyPoint({
      storedEnergy: FIXTURE_GAME_CONFIG.maxEnergy,
      energyUpdatedAt: ENERGY_UPDATED_AT,
      currentTimestampSeconds: ENERGY_UPDATED_AT + 60n,
      gameConfig: FIXTURE_GAME_CONFIG,
    })

    expect(secondsUntilNextPoint).toBeNull()
  })

  it('counts down from the last regeneration anchor', () => {
    const secondsUntilNextPoint = calculateSecondsUntilNextEnergyPoint({
      storedEnergy: 4,
      energyUpdatedAt: ENERGY_UPDATED_AT,
      currentTimestampSeconds: ENERGY_UPDATED_AT + 600n,
      gameConfig: FIXTURE_GAME_CONFIG,
    })

    expect(secondsUntilNextPoint).toBe(FIXTURE_GAME_CONFIG.energyRegenerationSeconds - 600)
  })

  it('keeps partial progress after whole points have regenerated', () => {
    const regenerationSeconds = BigInt(FIXTURE_GAME_CONFIG.energyRegenerationSeconds)

    const secondsUntilNextPoint = calculateSecondsUntilNextEnergyPoint({
      storedEnergy: 4,
      energyUpdatedAt: ENERGY_UPDATED_AT,
      currentTimestampSeconds: ENERGY_UPDATED_AT + 2n * regenerationSeconds + 100n,
      gameConfig: FIXTURE_GAME_CONFIG,
    })

    expect(secondsUntilNextPoint).toBe(FIXTURE_GAME_CONFIG.energyRegenerationSeconds - 100)
  })

  it('returns null once regeneration has refilled energy to the cap', () => {
    const regenerationSeconds = BigInt(FIXTURE_GAME_CONFIG.energyRegenerationSeconds)

    const secondsUntilNextPoint = calculateSecondsUntilNextEnergyPoint({
      storedEnergy: FIXTURE_GAME_CONFIG.maxEnergy - 1,
      energyUpdatedAt: ENERGY_UPDATED_AT,
      currentTimestampSeconds: ENERGY_UPDATED_AT + regenerationSeconds,
      gameConfig: FIXTURE_GAME_CONFIG,
    })

    expect(secondsUntilNextPoint).toBeNull()
  })

  it('waits a whole interval when the device clock is behind chain time', () => {
    const secondsUntilNextPoint = calculateSecondsUntilNextEnergyPoint({
      storedEnergy: 4,
      energyUpdatedAt: ENERGY_UPDATED_AT,
      currentTimestampSeconds: ENERGY_UPDATED_AT - 30n,
      gameConfig: FIXTURE_GAME_CONFIG,
    })

    expect(secondsUntilNextPoint).toBe(FIXTURE_GAME_CONFIG.energyRegenerationSeconds)
  })
})
