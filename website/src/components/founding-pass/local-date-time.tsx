'use client'

import { useEffect, useState } from 'react'

type LocalDateTimeProps = {
  /** An ISO timestamp. */
  isoTimestamp: string
  className?: string
}

const utcFormat = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'UTC',
  timeZoneName: 'short',
})

/**
 * A date and time from the schedule. The static HTML shows it in UTC, named, then the browser
 * switches it to the visitor's own time without an offset ("Sat 28 Nov, 8:00 pm", D-050). The
 * zone's name stays in the tooltip.
 */
export function LocalDateTime({ isoTimestamp, className = '' }: LocalDateTimeProps) {
  const date = new Date(isoTimestamp)
  const [formattedText, setFormattedText] = useState(() => utcFormat.format(date))
  const [timeZoneText, setTimeZoneText] = useState<string | undefined>(undefined)

  useEffect(() => {
    const localDate = new Date(isoTimestamp)
    const localFormat = new Intl.DateTimeFormat('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    setFormattedText(localFormat.format(localDate))
    setTimeZoneText(
      new Intl.DateTimeFormat('en-GB', { timeZoneName: 'long' })
        .formatToParts(localDate)
        .find((part) => part.type === 'timeZoneName')?.value,
    )
  }, [isoTimestamp])

  return (
    <time dateTime={isoTimestamp} title={timeZoneText} className={className}>
      {formattedText}
    </time>
  )
}
