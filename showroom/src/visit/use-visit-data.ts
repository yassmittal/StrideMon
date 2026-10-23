'use client'

import { useEffect } from 'react'
import { deepLinkCopy } from '@/content/showroom'
import { readDeepLinkDesignNumber } from '@/lib/find-sneaker'
import { visitStore } from '@/lib/visit-store'
import { walkController } from './walk-controller'

// The visit's data from outside the store: the deep link (`?pass=137`, brief §10).

/** On the first render: a good link opens on the stand with its card; a bad one says so calmly. */
export function useDeepLink(): void {
  useEffect(() => {
    const passText = new URLSearchParams(window.location.search).get('pass')
    if (passText === null || passText === '') return
    const designNumber = readDeepLinkDesignNumber(passText)
    if (designNumber === null) {
      visitStore.update({ notice: deepLinkCopy.notFound(passText.slice(0, 12)) })
      return
    }
    visitStore.update({ standDesignNumber: designNumber })
    walkController.startAtStand()
  }, [])
}
