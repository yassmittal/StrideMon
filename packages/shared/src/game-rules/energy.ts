import type { GameConfig } from './game-config'

type EnergyState = {
  storedEnergy: number
  /** Unix seconds that regeneration is counted from (the Sneaker's `energyUpdatedAt`). */
  energyUpdatedAt: bigint
}

type CalculateCurrentEnergyInput = EnergyState & {
  currentTimestampSeconds: bigint
  gameConfig: GameConfig
}

/**
 * Energy available now: `min(maxEnergy, storedEnergy + regeneratedPoints)`.
 * Mirrors `GameMath.calculateCurrentEnergy`.
 */
export function calculateCurrentEnergy({
  storedEnergy,
  energyUpdatedAt,
  currentTimestampSeconds,
  gameConfig,
}: CalculateCurrentEnergyInput): number {
  const regeneratedPoints = calculateRegeneratedPoints({
    energyUpdatedAt,
    currentTimestampSeconds,
    gameConfig,
  })
  const uncappedEnergy = BigInt(storedEnergy) + regeneratedPoints
  const maxEnergy = BigInt(gameConfig.maxEnergy)
  return Number(uncappedEnergy > maxEnergy ? maxEnergy : uncappedEnergy)
}

/**
 * Stored energy and regeneration anchor after spending `energySpent`. The anchor
 * advances by the whole intervals credited, not to now, so partial progress
 * toward the next point carries over. Mirrors `GameMath.calculateEnergyAfterSpending`.
 */
export function calculateEnergyAfterSpending({
  energySpent,
  ...currentEnergyInput
}: CalculateCurrentEnergyInput & { energySpent: number }): EnergyState {
  const currentEnergy = calculateCurrentEnergy(currentEnergyInput)
  if (energySpent > currentEnergy) {
    throw new RangeError(`Cannot spend ${energySpent} energy with only ${currentEnergy} available`)
  }
  const regeneratedPoints = calculateRegeneratedPoints(currentEnergyInput)
  const creditedSeconds =
    regeneratedPoints * BigInt(currentEnergyInput.gameConfig.energyRegenerationSeconds)
  return {
    storedEnergy: currentEnergy - energySpent,
    energyUpdatedAt: currentEnergyInput.energyUpdatedAt + creditedSeconds,
  }
}

function calculateRegeneratedPoints({
  energyUpdatedAt,
  currentTimestampSeconds,
  gameConfig,
}: Omit<CalculateCurrentEnergyInput, 'storedEnergy'>): bigint {
  // A device clock behind chain time would go negative; on-chain that can't happen.
  const elapsedSeconds = currentTimestampSeconds - energyUpdatedAt
  if (elapsedSeconds <= 0n) return 0n
  return elapsedSeconds / BigInt(gameConfig.energyRegenerationSeconds)
}
