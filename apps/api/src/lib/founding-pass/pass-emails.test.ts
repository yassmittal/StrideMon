import { describe, expect, it } from 'bun:test'
import { buildEmailCodeEmail, buildWaitlistWindowEmail, formatScheduleTime } from './pass-emails'

const SCHEDULE_TIMES = {
  waitlistWindowStartsAt: new Date('2026-11-28T14:30:00Z'),
  openMintStartsAt: new Date('2026-11-30T14:30:00Z'),
  backupOpeningAt: new Date('2026-12-14T14:30:00Z'),
}

describe('pass emails', () => {
  it('formats a schedule time in India and UTC', () => {
    expect(formatScheduleTime(SCHEDULE_TIMES.waitlistWindowStartsAt)).toBe(
      'Sat 28 Nov, 20:00 IST (14:30 UTC)',
    )
  })

  it('puts the code in the subject and the body', () => {
    const codeEmail = buildEmailCodeEmail({ emailCode: '004817', validForMinutes: 10 })

    expect(codeEmail.subject).toBe('004817 is your StrideMon code')
    expect(codeEmail.textBody).toContain('Your code is 004817.')
    expect(codeEmail.htmlBody).toContain('It works for 10 minutes.')
  })

  it('says "now" once the window is open, and names both ends of the 48 hours', () => {
    const openedEmail = buildWaitlistWindowEmail({
      scheduleTimes: SCHEDULE_TIMES,
      now: new Date('2026-11-28T14:31:00Z'),
    })
    const earlyEmail = buildWaitlistWindowEmail({
      scheduleTimes: SCHEDULE_TIMES,
      now: new Date('2026-11-27T09:00:00Z'),
    })

    expect(openedEmail.subject).toBe('Your 48 hours start now')
    expect(earlyEmail.subject).toBe('Your 48 hours start Sat 28 Nov, 20:00 IST (14:30 UTC)')
    expect(openedEmail.textBody).toContain(
      'Sat 28 Nov, 20:00 IST (14:30 UTC) to Mon 30 Nov, 20:00 IST (14:30 UTC)',
    )
    expect(openedEmail.textBody).toContain('It can’t be sent or sold.')
  })
})
