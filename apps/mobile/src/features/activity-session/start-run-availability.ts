import { formatDuration } from '../../lib/format/format-duration'

/** Why START is disabled (game-rules.md → Starting a session). Ownership is checked by the API. */
export type StartRunBlockedReason = 'outOfEnergy' | 'needsRepair'

export function findStartRunBlockedReason({
  currentEnergy,
  durability,
}: {
  currentEnergy: number
  durability: number
}): StartRunBlockedReason | null {
  if (currentEnergy < 1) return 'outOfEnergy'
  if (durability < 1) return 'needsRepair'
  return null
}

export function describeStartRunBlockedReason({
  blockedReason,
  secondsUntilNextEnergyPoint,
}: {
  blockedReason: StartRunBlockedReason
  secondsUntilNextEnergyPoint: number | null
}): string {
  switch (blockedReason) {
    case 'outOfEnergy':
      return secondsUntilNextEnergyPoint === null
        ? 'Your Sneaker is out of energy. It regenerates over time.'
        : `Your Sneaker is out of energy. The next point arrives in ${formatDuration(secondsUntilNextEnergyPoint)}.`
    case 'needsRepair':
      return 'Your Sneaker is worn out. Repair it to run again.'
    default: {
      const unhandledReason: never = blockedReason
      throw new Error(`Unhandled blocked reason: ${String(unhandledReason)}`)
    }
  }
}
