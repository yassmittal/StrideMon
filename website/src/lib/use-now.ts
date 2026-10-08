'use client'

import { useEffect, useState } from 'react'

/**
 * The current time, updated every `intervalMilliseconds`. Null on the server and in the first
 * render, so time-dependent text never differs between the static HTML and hydration.
 */
export function useNow(intervalMilliseconds: number): Date | null {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const intervalId = window.setInterval(() => setNow(new Date()), intervalMilliseconds)
    return () => window.clearInterval(intervalId)
  }, [intervalMilliseconds])
  return now
}
