import type { PassSchedule } from '@stridemon/shared/api-contracts'
import { formatDateTime } from '../../lib/format/format-date-time'

type MintProgress = {
  schedule: PassSchedule
  mintedCount: number
  designCount: number
}

/** Where the mint is now, and what someone without a pass can do about it. */
export function describeMintPhase({ schedule, mintedCount, designCount }: MintProgress): string {
  switch (schedule.phase) {
    case 'preview':
      return `Minting opens ${formatDateTime(schedule.waitlistWindowStartsAt)} for people on the waitlist, and ${formatDateTime(schedule.openMintStartsAt)} for everyone. Until then, browse the ${formatCount(designCount)} designs and pick a favourite.`
    case 'waitlistWindow':
      return `The waitlist window is open: people who joined the waitlist can mint now. Everyone else can mint from ${formatDateTime(schedule.openMintStartsAt)}.`
    case 'openMint':
      return `Minting is open to everyone. ${formatCount(mintedCount)} of ${formatCount(designCount)} minted.`
    case 'allMinted':
    case 'openToAll':
      return 'The app is open to everyone now. Getting your free Sneaker…'
    default: {
      const unhandledPhase: never = schedule.phase
      throw new Error(`Unhandled pass schedule phase: ${String(unhandledPhase)}`)
    }
  }
}

/** When the gate goes away by itself (D-041): all minted, or the backup date. */
export function describeOpeningDay({
  schedule,
  designCount,
}: Pick<MintProgress, 'schedule' | 'designCount'>): string {
  return `The app opens to everyone when all ${formatCount(designCount)} are minted, or on ${formatDateTime(schedule.backupOpeningAt)} at the latest. Then anyone can play with a free Sneaker.`
}

function formatCount(count: number): string {
  return count.toLocaleString('en-US')
}
