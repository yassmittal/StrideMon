'use client'

import { useEffect } from 'react'
import { rememberArrivalInviteCode } from '@/lib/waitlist-invites'
import { rememberArrivalSource } from '@/lib/waitlist-request'

/**
 * Keeps a friend's `?ref=` (D-056) and the `?source=` for the whole visit, on whichever page they
 * arrive, so someone who browses /pass first still joins with them. Renders nothing.
 */
export function ArrivalInviteKeeper() {
  useEffect(() => {
    rememberArrivalInviteCode(window.location.search)
    rememberArrivalSource(window.location.search)
  }, [])
  return null
}
