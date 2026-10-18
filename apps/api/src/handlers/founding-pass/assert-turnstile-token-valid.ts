import { ApiError } from '../../common/api-error'
import type { TurnstileAction, TurnstileVerifier } from '../../services/turnstile-verifier'

const HTTP_STATUS_FORBIDDEN = 403

/** Send code, Mint and joining the waitlist check Turnstile before anything else (D-043, D-056). */
export async function assertTurnstileTokenValid({
  turnstileVerifier,
  turnstileToken,
  remoteIpAddress,
  expectedAction,
}: {
  turnstileVerifier: TurnstileVerifier
  /** Missing only on joining, from a page loaded before joining had Turnstile: it fails. */
  turnstileToken: string | undefined
  remoteIpAddress: string
  /** The widget's action for this route: a Send code token can't be spent on a mint. */
  expectedAction: TurnstileAction
}): Promise<void> {
  const isValid =
    turnstileToken !== undefined &&
    (await turnstileVerifier.isTurnstileTokenValid({
      turnstileToken,
      remoteIpAddress,
      expectedAction,
    }))
  if (!isValid) throw new ApiError('TURNSTILE_FAILED', HTTP_STATUS_FORBIDDEN)
}
