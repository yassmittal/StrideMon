import { shortenAddress } from '@/content/contracts'
import { passCardContent } from '@/content/founding-pass'
import type { PassAvailability, RecentPassMint } from '@/lib/founding-pass/pass-collection'

type PassAvailabilityTextProps = {
  availability: PassAvailability | null
  recentMint: RecentPassMint | null
  /** Say "Available" too. The grid leaves it out, so only taken passes carry a line. */
  isAvailableShown?: boolean
  className?: string
}

/** "Minted by 0x3fA1…c9a1", "Minted", "Being minted" or "Available". Nothing while unknown. */
export function PassAvailabilityText({
  availability,
  recentMint,
  isAvailableShown = false,
  className = '',
}: PassAvailabilityTextProps) {
  const text = readAvailabilityText(availability, recentMint, isAvailableShown)
  if (text === null) return null
  return <span className={className}>{text}</span>
}

function readAvailabilityText(
  availability: PassAvailability | null,
  recentMint: RecentPassMint | null,
  isAvailableShown: boolean,
): string | null {
  if (availability === 'minted') {
    return recentMint === null
      ? passCardContent.minted
      : `${passCardContent.mintedByPrefix} ${shortenAddress(recentMint.walletAddress)}`
  }
  if (availability === 'pending') return passCardContent.pending
  if (availability === 'available' && isAvailableShown) return passCardContent.available
  return null
}
