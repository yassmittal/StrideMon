import type { Db } from 'mongodb'
import { ApiError } from '../../common/api-error'
import type { PassSchedulePosition, PassScheduleTimes } from '../../lib/founding-pass/pass-schedule'
import { findWaitlistSignupByEmail } from '../../repositories/waitlist-signups-repository'

const HTTP_STATUS_FORBIDDEN = 403
const HTTP_STATUS_CONFLICT = 409

/**
 * Minting is open in the waitlist window (for emails that joined the waitlist before it opened)
 * and in the open mint (D-041). Every other phase has its own refusal, with the time to come back.
 */
export async function assertPassMintingOpen({
  database,
  schedulePosition,
  scheduleTimes,
  email,
}: {
  database: Db
  schedulePosition: PassSchedulePosition
  scheduleTimes: PassScheduleTimes
  email: string
}): Promise<void> {
  switch (schedulePosition.phase) {
    case 'preview':
      throw new ApiError('PASS_MINT_NOT_OPEN', HTTP_STATUS_CONFLICT, {
        opensAt: scheduleTimes.waitlistWindowStartsAt.toISOString(),
      })
    case 'waitlistWindow': {
      const waitlistSignup = await findWaitlistSignupByEmail(database, email)
      const hasJoinedBeforeWindow =
        waitlistSignup !== null &&
        waitlistSignup.createdAt.getTime() < scheduleTimes.waitlistWindowStartsAt.getTime()
      if (!hasJoinedBeforeWindow) {
        throw new ApiError('PASS_WAITLIST_WINDOW_ONLY', HTTP_STATUS_FORBIDDEN, {
          openMintStartsAt: scheduleTimes.openMintStartsAt.toISOString(),
        })
      }
      return
    }
    case 'openMint':
      return
    case 'allMinted':
      throw new ApiError('PASS_ALL_MINTED', HTTP_STATUS_CONFLICT)
    case 'openToAll':
      throw new ApiError('PASS_MINT_CLOSED', HTTP_STATUS_CONFLICT)
    default: {
      const unhandledPhase: never = schedulePosition.phase
      throw new Error(`Unhandled pass schedule phase: ${String(unhandledPhase)}`)
    }
  }
}
