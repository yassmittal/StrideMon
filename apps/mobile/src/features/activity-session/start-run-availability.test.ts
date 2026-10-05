import { describeStartRunBlockedReason, findStartRunBlockedReason } from './start-run-availability'

describe('findStartRunBlockedReason', () => {
  it('lets a Sneaker with energy and durability start', () => {
    expect(
      findStartRunBlockedReason({ isGamePaused: false, currentEnergy: 1, durability: 1 }),
    ).toBeNull()
  })

  it('blocks a Sneaker with no energy', () => {
    expect(
      findStartRunBlockedReason({ isGamePaused: false, currentEnergy: 0, durability: 100 }),
    ).toBe('outOfEnergy')
  })

  it('blocks a worn-out Sneaker', () => {
    expect(
      findStartRunBlockedReason({ isGamePaused: false, currentEnergy: 10, durability: 0 }),
    ).toBe('needsRepair')
  })

  it('blocks every Sneaker while the game is paused for maintenance', () => {
    expect(
      findStartRunBlockedReason({ isGamePaused: true, currentEnergy: 10, durability: 100 }),
    ).toBe('gamePaused')
  })
})

describe('describeStartRunBlockedReason', () => {
  it('says when the next energy point arrives', () => {
    expect(
      describeStartRunBlockedReason({
        blockedReason: 'outOfEnergy',
        secondsUntilNextEnergyPoint: 754,
      }),
    ).toBe('Your Sneaker is out of energy. The next point arrives in 12:34.')
  })

  it('asks for a repair when durability is gone', () => {
    expect(
      describeStartRunBlockedReason({
        blockedReason: 'needsRepair',
        secondsUntilNextEnergyPoint: null,
      }),
    ).toBe('Your Sneaker is worn out. Repair it to run again.')
  })
})
