'use client'

import { useEffect, useState } from 'react'
import { waitlistContent } from '@/content/waitlist'
import { readWaitlistCount } from '@/lib/waitlist-request'

/**
 * "1,240 people on the waitlist for 1,000 passes" (D-056), from the API's cached count. Shown only
 * once the waitlist is bigger than the collection; below that, and if the API can't be reached,
 * nothing shows.
 */
export function WaitlistCount() {
  const [signupCount, setSignupCount] = useState<number | null>(null)
  useEffect(() => {
    let isCancelled = false
    void readWaitlistCount().then((result) => {
      if (!isCancelled && result.isOk) setSignupCount(result.data)
    })
    return () => {
      isCancelled = true
    }
  }, [])
  if (signupCount === null || signupCount < waitlistContent.countShownFrom) return null
  return (
    <p className="font-mono text-sm leading-[1.4] tracking-[0.04em] uppercase">
      {waitlistContent.buildCountLine(signupCount)}
    </p>
  )
}
