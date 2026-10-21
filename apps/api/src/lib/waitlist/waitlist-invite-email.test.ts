import { describe, expect, it } from 'bun:test'
import { buildWaitlistInviteEmail } from './waitlist-invite-email'

const INVITE_URL = 'https://stridemon.xyz/waitlist?ref=7K2QM9XD'
const EMAIL_TIMES = {
  waitlistWindowStartsAt: new Date('2026-11-28T14:30:00Z'),
  earlyHourStartsAt: new Date('2026-11-28T13:30:00Z'),
}

describe('the invite email (D-062)', () => {
  it('says you’re on the list, how the early hour works, your link and the limit', () => {
    const inviteEmail = buildWaitlistInviteEmail({
      kind: 'welcome',
      inviteUrl: INVITE_URL,
      ...EMAIL_TIMES,
      confirmedFriendCount: 0,
    })

    expect(inviteEmail.subject).toBe('You’re on the StrideMon list. Want the early hour?')
    expect(inviteEmail.textBody).toContain(
      'From Sat 28 Nov, 20:00 IST (14:30 UTC), you can mint a free Founding Pass',
    )
    expect(inviteEmail.textBody).toContain(
      'When 3 of them join the waitlist with it, your window opens at Sat 28 Nov, 19:00 IST (13:30 UTC).',
    )
    expect(inviteEmail.textBody).toContain(`Your link: ${INVITE_URL}`)
    expect(inviteEmail.textBody).toContain('only 250 passes go in that early hour')
    expect(inviteEmail.textBody).not.toContain('so far')
    expect(inviteEmail.textBody).not.toContain('spot')
    expect(inviteEmail.textBody).toContain('Next email: when your window opens.')
  })

  it('makes the link a link in the HTML', () => {
    const inviteEmail = buildWaitlistInviteEmail({
      kind: 'welcome',
      inviteUrl: INVITE_URL,
      ...EMAIL_TIMES,
      confirmedFriendCount: 0,
    })

    expect(inviteEmail.htmlBody).toContain(`<a href="${INVITE_URL}"`)
  })

  it('tells the list from before why it came, with their friends so far', () => {
    const inviteEmail = buildWaitlistInviteEmail({
      kind: 'existingList',
      inviteUrl: INVITE_URL,
      ...EMAIL_TIMES,
      confirmedFriendCount: 2,
    })

    expect(inviteEmail.textBody).toContain('Friends who’ve joined with your link so far: 2 of 3.')
    expect(inviteEmail.textBody).toContain(
      'Why this email: invite links are new since you joined, so this is one extra email.',
    )
    expect(inviteEmail.textBody).not.toContain('Next email:')
  })
})
