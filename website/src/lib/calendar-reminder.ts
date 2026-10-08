// A calendar reminder with no account and no email (D-045): a Google Calendar link, and an .ics
// file for Apple Calendar and Outlook.

export type CalendarReminder = {
  title: string
  details: string
  url: string
  startsAt: Date
  durationMinutes: number
}

export function buildGoogleCalendarUrl(reminder: CalendarReminder): string {
  const parameters = new URLSearchParams({
    action: 'TEMPLATE',
    text: reminder.title,
    dates: `${formatCalendarTime(reminder.startsAt)}/${formatCalendarTime(readEndsAt(reminder))}`,
    details: reminder.details,
    location: reminder.url,
  })
  return `https://calendar.google.com/calendar/render?${parameters.toString()}`
}

/** An .ics file as a data URL, for a download link. */
export function buildIcsDataUrl(reminder: CalendarReminder): string {
  const icsText = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//StrideMon//Founding Pass//EN',
    'BEGIN:VEVENT',
    `UID:${formatCalendarTime(reminder.startsAt)}-open-mint@stridemon.xyz`,
    `DTSTAMP:${formatCalendarTime(new Date())}`,
    `DTSTART:${formatCalendarTime(reminder.startsAt)}`,
    `DTEND:${formatCalendarTime(readEndsAt(reminder))}`,
    `SUMMARY:${escapeIcsText(reminder.title)}`,
    `DESCRIPTION:${escapeIcsText(reminder.details)}`,
    `URL:${reminder.url}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT10M',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcsText(reminder.title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(icsText)}`
}

function readEndsAt(reminder: CalendarReminder): Date {
  return new Date(reminder.startsAt.getTime() + reminder.durationMinutes * 60_000)
}

/** `20261130T143000Z`: UTC, so every calendar shows it in its own time zone. */
function formatCalendarTime(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')
}

function escapeIcsText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}
