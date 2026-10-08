/**
 * The deliverability check (D-043): sends one sample code email through Brevo, exactly as the
 * API sends it, to the address you give.
 *
 *   cd apps/api && bun run pass:send-test-email you@gmail.com
 *
 * Reads only BREVO_API_KEY and EMAIL_SENDER_ADDRESS from `.env`. Touches neither Mongo nor the
 * chain. The code in it isn't valid anywhere. Then open it in Gmail → ⋮ → Show original: SPF,
 * DKIM and DMARC should say PASS, and DKIM should be signed by stridemon.xyz.
 */
import { z } from 'zod'
import { EMAIL_CODE_VALID_MINUTES } from '../handlers/founding-pass/send-pass-email-code'
import { generateEmailCode } from '../lib/founding-pass/email-code'
import { buildEmailCodeEmail } from '../lib/founding-pass/pass-emails'
import { createBrevoEmailSender } from '../services/email-sender'

const recipientEmailAddress = z.email().parse(process.argv[2])
const brevoApiKey = z
  .string()
  .min(1, 'BREVO_API_KEY is missing from .env')
  .parse(process.env.BREVO_API_KEY)
const senderAddress = z.email().parse(process.env.EMAIL_SENDER_ADDRESS)

await createBrevoEmailSender({ brevoApiKey, senderAddress }).sendEmail({
  toEmailAddress: recipientEmailAddress,
  ...buildEmailCodeEmail({
    emailCode: generateEmailCode(),
    validForMinutes: EMAIL_CODE_VALID_MINUTES,
  }),
})
process.stdout.write(
  `Sent a sample code email from ${senderAddress} to ${recipientEmailAddress}.\n`,
)
