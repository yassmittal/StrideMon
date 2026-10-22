'use client'

import { collectionCopy } from '@/content/showroom'
import { usePassCollection } from '@/lib/collection/use-pass-collection'

// The one quiet line when the minted state can't be read (brief §7.5): everything else still
// works, and it goes away by itself when the API answers again.

export function CollectionNotice() {
  const { requestStatus } = usePassCollection()
  if (requestStatus !== 'failed') return null
  return (
    <p
      role="status"
      className="max-w-[15rem] font-mono text-[10px] text-on-dark-secondary uppercase leading-snug sm:max-w-[20rem] sm:text-label"
    >
      {collectionCopy.unavailable}
    </p>
  )
}
