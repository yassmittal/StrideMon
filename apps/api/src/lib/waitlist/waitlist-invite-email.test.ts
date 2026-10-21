import { describe, expect, it } from 'bun:test'
import { buildWaitlistInviteEmail } from './waitlist-invite-email'

const INVITE_URL = 'https://stridemon.xyz/waitlist?ref=7K2QM9XD'
const EMAIL_TIMES = {
  waitlistWindowStartsAt: new Date('2026-11-28T14:30:00Z'),
  earlyHourStartsAt: new Date('2026-11-28T13:30:00Z'),
}

describe('the invite email (D-062)', () => {
  it('reads as a note from Yash: you’re on the list, the early hour, the link, the limit', () => {
    const inviteEmail = buildWaitlistInviteEmail({
      kind: 'welcome',
      inviteUrl: INVITE_URL,
      ...EMAIL_TIMES,
      confirmedFriendCount: 0,
    })

    expect(inviteEmail.senderName).toBe('Yash from StrideMon')
    expect(inviteEmail.subject).toBe('Your StrideMon invite link')
    expect(inviteEmail.textBody).toContain(
      'On Sat 28 Nov, 20:00 IST (14:30 UTC), you can mint your Founding Pass',
    )
    expect(inviteEmail.textBody).toContain(
      'your window opens at Sat 28 Nov, 19:00 IST (13:30 UTC). Only 250 passes go in that hour.',
    )
    expect(inviteEmail.textBody).toContain(`\n\n${INVITE_URL}\n\n`)
    expect(inviteEmail.textBody).not.toContain('So far')
    expect(inviteEmail.textBody).not.toContain('spot')
    expect(inviteEmail.textBody).toContain('The next email from us is when your window opens.')
    expect(inviteEmail.textBody).toContain('Just reply, I read every one.')
  })

  it('has one link, the invite link, and no styling', () => {
    const inviteEmail = buildWaitlistInviteEmail({
      kind: 'welcome',
      inviteUrl: INVITE_URL,
      ...EMAIL_TIMES,
      confirmedFriendCount: 0,
    })

    expect(inviteEmail.htmlBody.match(/<a /g)).toHaveLength(1)
    expect(inviteEmail.htmlBody).toContain(`<a href="${INVITE_URL}">`)
    expect(inviteEmail.htmlBody).not.toContain('style=')
  })

  it('tells the list from before why it came, with their friends so far', () => {
    const inviteEmail = buildWaitlistInviteEmail({
      kind: 'existingList',
      inviteUrl: INVITE_URL,
      ...EMAIL_TIMES,
      confirmedFriendCount: 1,
    })

    expect(inviteEmail.textBody).toContain('So far, 1 of your 3 friends has joined.')
    expect(inviteEmail.textBody).toContain(
      'You joined before invite links existed, so this is one extra email.',
    )
    expect(inviteEmail.textBody).not.toContain('The next email from us')
  })
})
