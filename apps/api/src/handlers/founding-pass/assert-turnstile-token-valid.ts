import { ApiError } from '../../common/api-error'
import type { TurnstileVerifier } from '../../services/turnstile-verifier'

const HTTP_STATUS_FORBIDDEN = 403

/** Send code and Mint check Turnstile before anything else (D-041, D-043). */
export async function assertTurnstileTokenValid({
  turnstileVerifier,
  turnstileToken,
  remoteIpAddress,
}: {
  turnstileVerifier: TurnstileVerifier
  turnstileToken: string
  remoteIpAddress: string
}): Promise<void> {
  const isValid = await turnstileVerifier.isTurnstileTokenValid({ turnstileToken, remoteIpAddress })
  if (!isValid) throw new ApiError('TURNSTILE_FAILED', HTTP_STATUS_FORBIDDEN)
}
