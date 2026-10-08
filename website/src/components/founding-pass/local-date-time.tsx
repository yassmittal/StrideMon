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
 * A date and time from the schedule. The static HTML shows it in UTC, then the browser switches
 * it to the visitor's own time zone, named, so nobody has to convert.
 */
export function LocalDateTime({ isoTimestamp, className = '' }: LocalDateTimeProps) {
  const date = new Date(isoTimestamp)
  const [formattedText, setFormattedText] = useState(() => utcFormat.format(date))

  useEffect(() => {
    const localFormat = new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    })
    setFormattedText(localFormat.format(new Date(isoTimestamp)))
  }, [isoTimestamp])

  return (
    <time dateTime={isoTimestamp} className={className}>
      {formattedText}
    </time>
  )
}
