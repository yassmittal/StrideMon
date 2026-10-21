import { EARLY_HOUR_PASS_LIMIT, REQUIRED_CONFIRMED_FRIEND_COUNT } from '@stridemon/shared/domain'
import {
  buildHtmlBody,
  buildTextBody,
  formatScheduleTime,
  type PassEmailContent,
} from '../founding-pass/pass-emails'

const INVITES_PAGE_URL = 'https://stridemon.xyz/waitlist/invites'

/**
 * `welcome`: sent as someone joins. `existingList`: the one-off to the sign-ups from before the
 * invite email existed, who were promised one email only, so it says why it came (D-062).
 */
export type WaitlistInviteEmailKind = 'welcome' | 'existingList'

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
}): PassEmailContent {
  const paragraphs = [
    `You’re on the StrideMon waitlist. From ${formatScheduleTime(waitlistWindowStartsAt)}, you can mint a free Founding Pass, 48 hours before everyone else.`,
    `Want to mint an hour earlier? Send your link to friends. When ${REQUIRED_CONFIRMED_FRIEND_COUNT} of them join the waitlist with it, your window opens at ${formatScheduleTime(earlyHourStartsAt)}.`,
    `Your link: ${inviteUrl}`,
    `Be quick: only ${EARLY_HOUR_PASS_LIMIT} passes go in that early hour, first come, first served.`,
    ...(confirmedFriendCount > 0
      ? [
          `Friends who’ve joined with your link so far: ${Math.min(confirmedFriendCount, REQUIRED_CONFIRMED_FRIEND_COUNT)} of ${REQUIRED_CONFIRMED_FRIEND_COUNT}.`,
        ]
      : []),
    `Watch your friends join: ${INVITES_PAGE_URL}`,
    kind === 'welcome'
      ? 'Next email: when your window opens. Nothing else, and nothing is for sale.'
      : 'Why this email: invite links are new since you joined, so this is one extra email. The next one comes when your window opens. Nothing is for sale.',
  ]
  return {
    subject: 'You’re on the StrideMon list. Want the early hour?',
    textBody: buildTextBody(paragraphs),
    htmlBody: buildHtmlBody(paragraphs),
  }
}
