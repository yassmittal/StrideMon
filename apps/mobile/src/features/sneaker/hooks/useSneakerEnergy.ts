import { sneakerGameAbi } from '@stridemon/chain'
import {
  calculateCurrentEnergy,
  calculateSecondsUntilNextEnergyPoint,
  type GameConfig,
} from '@stridemon/shared/game-rules'
import { useEffect, useRef, useState } from 'react'
import { useReadContract } from 'wagmi'
import { contractAddresses } from '../../../lib/chain/contract-addresses'
import { monadChain } from '../../../lib/chain/monad-chain'

const MILLISECONDS_PER_SECOND = 1000

type SneakerEnergyInput = {
  sneakerTokenId: bigint
  /** From `useSneakerAttributes`: the regeneration anchor the countdown runs from. */
  energyAnchor: { storedEnergy: number; energyUpdatedAt: bigint } | undefined
  gameConfig: GameConfig | undefined
}

export type SneakerEnergy = {
  currentEnergy: number
  maxEnergy: number
  /** `null` when energy is full. */
  secondsUntilNextEnergyPoint: number | null
}

/**
 * Energy now, read from `SneakerGame.currentEnergy`, plus a countdown to the next
 * point computed on the device. When the countdown passes a point, the chain is
 * read again, so the number shown always comes from the chain.
 */
export function useSneakerEnergy({ sneakerTokenId, energyAnchor, gameConfig }: SneakerEnergyInput) {
  const currentEnergyQuery = useReadContract({
    address: contractAddresses.sneakerGame,
    abi: sneakerGameAbi,
    functionName: 'currentEnergy',
    args: [sneakerTokenId],
    chainId: monadChain.id,
  })
  const currentTimestampSeconds = useTickingUnixSeconds()

  const energyInput =
    energyAnchor === undefined || gameConfig === undefined
      ? undefined
      : { ...energyAnchor, currentTimestampSeconds, gameConfig }
  const estimatedEnergy =
    energyInput === undefined ? undefined : calculateCurrentEnergy(energyInput)

  const { refetch: refetchCurrentEnergy } = currentEnergyQuery
  const previousEstimatedEnergy = useRef(estimatedEnergy)
  useEffect(() => {
    const hasRegeneratedPoint =
      previousEstimatedEnergy.current !== undefined &&
      estimatedEnergy !== undefined &&
      estimatedEnergy > previousEstimatedEnergy.current
    previousEstimatedEnergy.current = estimatedEnergy
    if (hasRegeneratedPoint) void refetchCurrentEnergy()
  }, [estimatedEnergy, refetchCurrentEnergy])

  const energy: SneakerEnergy | undefined =
    currentEnergyQuery.data === undefined || energyInput === undefined || gameConfig === undefined
      ? undefined
      : {
          currentEnergy: currentEnergyQuery.data,
          maxEnergy: gameConfig.maxEnergy,
          secondsUntilNextEnergyPoint:
            currentEnergyQuery.data >= gameConfig.maxEnergy
              ? null
              : calculateSecondsUntilNextEnergyPoint(energyInput),
        }

  return {
    energy,
    isLoading: currentEnergyQuery.isLoading,
    isError: currentEnergyQuery.isError,
    refetch: refetchCurrentEnergy,
  }
}

/** Unix time in whole seconds, updated every second. */
function useTickingUnixSeconds(): bigint {
  const [unixSeconds, setUnixSeconds] = useState(readUnixSeconds)
  useEffect(() => {
    const intervalHandle = setInterval(
      () => setUnixSeconds(readUnixSeconds()),
      MILLISECONDS_PER_SECOND,
    )
    return () => clearInterval(intervalHandle)
  }, [])
  return unixSeconds
}

function readUnixSeconds(): bigint {
  return BigInt(Math.floor(Date.now() / MILLISECONDS_PER_SECOND))
}
