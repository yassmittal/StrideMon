'use client'

import { useEffect } from 'react'
import { rememberArrivalInviteCode } from '@/lib/waitlist-invites'

/**
 * Keeps a friend's `?ref=` for the whole visit, on whichever page it arrives (D-056), so someone
 * who browses /pass first still joins with it. Renders nothing.
 */
export function ArrivalInviteKeeper() {
  useEffect(() => {
    rememberArrivalInviteCode(window.location.search)
  }, [])
  return null
}
