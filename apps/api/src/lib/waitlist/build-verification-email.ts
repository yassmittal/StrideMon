import type { OutgoingEmail } from '../../services/email-sender'
import { VERIFICATION_CODE_TTL_SECONDS } from './waitlist-line-rules'

const SITE_ADDRESS = 'stridemon.xyz'

const SECONDS_PER_MINUTE = 60

/** The email that carries a waitlist verification code (D-041). The code is digits only. */
export function buildVerificationEmail({
  toAddress,
  verificationCode,
}: {
  toAddress: string
  verificationCode: string
}): OutgoingEmail {
  const validMinutes = VERIFICATION_CODE_TTL_SECONDS / SECONDS_PER_MINUTE
  const instructions = `Enter it on ${SITE_ADDRESS} to verify your email and get your place in line for a StrideMon Founding Pass. It expires in ${validMinutes} minutes.`
  const ignoreNote =
    'If you didn’t ask for it, ignore this email. Nothing happens unless the code is entered.'

  return {
    toAddress,
    subject: `Your StrideMon code: ${verificationCode}`,
    textBody: [
      `Your StrideMon code is ${verificationCode}.`,
      instructions,
      ignoreNote,
      `StrideMon · ${SITE_ADDRESS}`,
    ].join('\n\n'),
    htmlBody: `<!doctype html>
<html><body style="margin:0;padding:32px 20px;background:#f0f1fa;font-family:-apple-system,'Segoe UI',Roboto,sans-serif;color:#000">
<div style="max-width:440px;margin:0 auto;background:#fff;border-radius:16px;padding:32px">
<p style="margin:0 0 8px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6b6b6b">StrideMon · Founding Pass</p>
<p style="margin:0 0 24px;font-size:16px">Your code:</p>
<p style="margin:0 0 24px;font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:36px;letter-spacing:.2em">${verificationCode}</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.45">${instructions}</p>
<p style="margin:0;font-size:13px;line-height:1.45;color:#6b6b6b">${ignoreNote}</p>
</div>
</body></html>`,
  }
}
