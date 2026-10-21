import { EARLY_HOUR_PASS_LIMIT, REQUIRED_CONFIRMED_FRIEND_COUNT } from '@stridemon/shared/domain'
import { escapeHtml, formatScheduleTime, type PassEmailContent } from '../founding-pass/pass-emails'

/**
 * `welcome`: sent as someone joins. `existingList`: the one-off to the sign-ups from before the
 * invite email existed, who were promised one email only, so it says why it came (D-062).
 */
export type WaitlistInviteEmailKind = 'welcome' | 'existingList'

export type WaitlistInviteEmailContent = PassEmailContent & { senderName: string }

// Written as a note from Yash, not a newsletter, so Gmail is less likely to file it under
// Promotions: a person's name, a plain subject, no sales words, one link, no styling, and a
// question to reply to (replies to hello@ are forwarded to Yash).
const SENDER_NAME = 'Yash from StrideMon'
const SUBJECT = 'Your StrideMon invite link'
const INVITES_PAGE_LABEL = 'stridemon.xyz/waitlist/invites'

/**
 * The invite email (D-062): you're on the list, the early hour and how to get it, your link, and
 * the limit. Words per D-060: the 250 is passes, never "spots", and nothing here promises a pass.
 */
export function buildWaitlistInviteEmail({
  kind,
  inviteUrl,
  waitlistWindowStartsAt,
  earlyHourStartsAt,
  confirmedFriendCount,
}: {
  kind: WaitlistInviteEmailKind
  inviteUrl: string
  waitlistWindowStartsAt: Date
  earlyHourStartsAt: Date
  confirmedFriendCount: number
}): WaitlistInviteEmailContent {
  const countedFriendCount = Math.min(confirmedFriendCount, REQUIRED_CONFIRMED_FRIEND_COUNT)
  const paragraphsBeforeLink = [
    'Hey, Yash here. I’m building StrideMon, and you’re on the waitlist.',
    `On ${formatScheduleTime(waitlistWindowStartsAt)}, you can mint your Founding Pass, 48 hours before everyone else.`,
    `Want to go an hour earlier? Send this link to ${REQUIRED_CONFIRMED_FRIEND_COUNT} friends. When they join the waitlist with it, your window opens at ${formatScheduleTime(earlyHourStartsAt)}. Only ${EARLY_HOUR_PASS_LIMIT} passes go in that hour.`,
  ]
  const paragraphsAfterLink = [
    ...(countedFriendCount > 0
      ? [
          `So far, ${countedFriendCount} of your ${REQUIRED_CONFIRMED_FRIEND_COUNT} friends ${countedFriendCount === 1 ? 'has' : 'have'} joined.`,
        ]
      : []),
    `You can see who’s counted at ${INVITES_PAGE_LABEL}.`,
    kind === 'welcome'
      ? 'The next email from us is when your window opens.'
      : 'You joined before invite links existed, so this is one extra email. The next one is when your window opens.',
    'Any questions? Just reply, I read every one.',
    'Yash',
  ]
  return {
    senderName: SENDER_NAME,
    subject: SUBJECT,
    textBody: [...paragraphsBeforeLink, inviteUrl, ...paragraphsAfterLink].join('\n\n'),
    htmlBody: buildLetterHtml({ paragraphsBeforeLink, inviteUrl, paragraphsAfterLink }),
  }
}

// A letter, not a layout: the mail app's own font and colours, and the invite link the only link.
function buildLetterHtml({
  paragraphsBeforeLink,
  inviteUrl,
  paragraphsAfterLink,
}: {
  paragraphsBeforeLink: readonly string[]
  inviteUrl: string
  paragraphsAfterLink: readonly string[]
}): string {
  const toParagraphHtml = (paragraph: string) => `<p>${escapeHtml(paragraph)}</p>`
  const escapedInviteUrl = escapeHtml(inviteUrl)
  return [
    ...paragraphsBeforeLink.map(toParagraphHtml),
    `<p><a href="${escapedInviteUrl}">${escapedInviteUrl}</a></p>`,
    ...paragraphsAfterLink.map(toParagraphHtml),
  ].join('')
}
