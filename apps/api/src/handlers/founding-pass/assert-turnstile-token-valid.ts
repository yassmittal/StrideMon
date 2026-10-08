import { ApiError } from '../../common/api-error'
import type { TurnstileAction, TurnstileVerifier } from '../../services/turnstile-verifier'

const HTTP_STATUS_FORBIDDEN = 403

/** Send code and Mint check Turnstile before anything else (D-041, D-043). */
export async function assertTurnstileTokenValid({
  turnstileVerifier,
  turnstileToken,
  remoteIpAddress,
  expectedAction,
}: {
  turnstileVerifier: TurnstileVerifier
  turnstileToken: string
  remoteIpAddress: string
  /** The widget's action for this route: a Send code token can't be spent on a mint. */
  expectedAction: TurnstileAction
}): Promise<void> {
  const isValid = await turnstileVerifier.isTurnstileTokenValid({
    turnstileToken,
    remoteIpAddress,
    expectedAction,
  })
  if (!isValid) throw new ApiError('TURNSTILE_FAILED', HTTP_STATUS_FORBIDDEN)
}
