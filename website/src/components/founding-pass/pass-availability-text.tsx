import { shortenAddress } from '@/content/contracts'
import { passCardContent } from '@/content/founding-pass'
import type { PassAvailability, RecentPassMint } from '@/lib/founding-pass/pass-collection'

type PassAvailabilityProps = {
  availability: PassAvailability | null
  recentMint: RecentPassMint | null
}

/** The grid's line under a taken pass: "Minted by 0x3fA1…c9a1", "Minted" or "Being minted". */
export function PassAvailabilityText({
  availability,
  recentMint,
  className = '',
}: PassAvailabilityProps & { className?: string }) {
  if (availability === 'minted') {
    return (
      <span className={className}>
        {recentMint === null
          ? passCardContent.minted
          : `${passCardContent.mintedByPrefix} ${shortenAddress(recentMint.walletAddress)}`}
      </span>
    )
  }
  if (availability === 'pending')
    return <span className={className}>{passCardContent.pending}</span>
  return null
}

const statusPillClassName =
  'inline-flex h-8 items-center gap-2 rounded-full px-3.5 text-label font-medium tracking-[0.08em] uppercase'

/**
 * One pass's status, as a pill you can't miss (D-073): Available is black with a lime dot, a pass
 * being minted pulses, a minted one is grey. Nothing while unknown.
 */
export function PassStatusPill({ availability, recentMint }: PassAvailabilityProps) {
  if (availability === 'available') {
    return (
      <span className={`${statusPillClassName} bg-dark text-on-dark`}>
        <span aria-hidden="true" className="size-2 rounded-full bg-lime" />
        {passCardContent.available}
      </span>
    )
  }
  if (availability === 'pending') {
    return (
      <span className={`${statusPillClassName} bg-surface-muted text-ink`}>
        <span aria-hidden="true" className="pass-mint-pulse size-2 rounded-full bg-ink" />
        {passCardContent.pending}
      </span>
    )
  }
  if (availability === 'minted') {
    return (
      <span className={`${statusPillClassName} bg-surface-muted text-ink`}>
        {recentMint === null ? passCardContent.minted : passCardContent.mintedByPrefix}
        {recentMint === null ? null : (
          <span className="font-mono tracking-normal normal-case">
            {shortenAddress(recentMint.walletAddress)}
          </span>
        )}
      </span>
    )
  }
  return null
}
