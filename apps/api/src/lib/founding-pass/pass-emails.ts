import type { PassScheduleTimes } from './pass-schedule'

/** An email's words, before it has an address. */
export type PassEmailContent = { subject: string; textBody: string; htmlBody: string }

const PASS_PAGE_URL = 'https://stridemon.xyz/pass'
const PASS_PAGE_LABEL = 'stridemon.xyz/pass'
const FREE_PASS_LINE = 'Free. It can’t be sent or sold. It isn’t a token and never turns into one.'

/** The 6-digit code email. The code leads the subject, so it shows in the notification. */
export function buildEmailCodeEmail({
  emailCode,
  validForMinutes,
}: {
  emailCode: string
  validForMinutes: number
}): PassEmailContent {
  const paragraphs = [
    `Your code is ${emailCode}.`,
    `Type it on ${PASS_PAGE_LABEL} to check your email. It works for ${validForMinutes} minutes.`,
    'Didn’t ask for it? Ignore this email. Nothing happens without the code.',
  ]
  return {
    subject: `${emailCode} is your StrideMon code`,
    textBody: buildTextBody(paragraphs),
    htmlBody: buildHtmlBody(paragraphs),
  }
}

/**
 * The waitlist's one email (D-043): when the 48 hours open and close, and how to mint. Sent at
 * the window's start, or earlier when the list is longer than one day of sending.
 */
export function buildWaitlistWindowEmail({
  scheduleTimes,
  now,
}: {
  scheduleTimes: PassScheduleTimes
  now: Date
}): PassEmailContent {
  const hasWindowStarted = now.getTime() >= scheduleTimes.waitlistWindowStartsAt.getTime()
  const windowStartLabel = formatScheduleTime(scheduleTimes.waitlistWindowStartsAt)
  const windowEndLabel = formatScheduleTime(scheduleTimes.openMintStartsAt)
  const paragraphs = [
    'You joined the StrideMon waitlist, so you can mint a Founding Pass before anyone else.',
    `Your 48 hours: ${windowStartLabel} to ${windowEndLabel}. In those hours only people on the waitlist can mint. After that, anyone can mint what’s left.`,
    `How to mint: open ${PASS_PAGE_LABEL}, pick the design you love, check your email with a code, connect your wallet, and mint. Use this email address: it’s the one on the waitlist. There’s no gas to pay.`,
    FREE_PASS_LINE,
    `This is the one email we promised. Questions? The help is on ${PASS_PAGE_LABEL}.`,
  ]
  return {
    subject: hasWindowStarted
      ? 'Your 48 hours start now'
      : `Your 48 hours start ${windowStartLabel}`,
    textBody: buildTextBody(paragraphs),
    htmlBody: buildHtmlBody(paragraphs),
  }
}

/** "Sat 28 Nov, 20:00 IST (14:30 UTC)": most of the list is in India, the rest gets UTC. */
export function formatScheduleTime(time: Date): string {
  const indiaParts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(time)
  const readPart = (partType: Intl.DateTimeFormatPartTypes) =>
    indiaParts.find((part) => part.type === partType)?.value ?? ''
  const utcTime = time.toISOString().slice(11, 16)
  return `${readPart('weekday')} ${readPart('day')} ${readPart('month')}, ${readPart('hour')}:${readPart('minute')} IST (${utcTime} UTC)`
}

function buildTextBody(paragraphs: readonly string[]): string {
  return [...paragraphs, `StrideMon · ${PASS_PAGE_URL}`].join('\n\n')
}

// Plain and quiet, like the site: one column, no images, no tracking pixels.
function buildHtmlBody(paragraphs: readonly string[]): string {
  const paragraphHtml = paragraphs
    .map((paragraph) => `<p style="margin:0 0 16px">${escapeHtml(paragraph)}</p>`)
    .join('')
  return `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.5;color:#111;max-width:480px">${paragraphHtml}<p style="margin:24px 0 0;color:#666;font-size:13px">StrideMon · <a href="${PASS_PAGE_URL}" style="color:#666">${PASS_PAGE_LABEL}</a></p></div>`
}

function escapeHtml(text: string): string {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}
