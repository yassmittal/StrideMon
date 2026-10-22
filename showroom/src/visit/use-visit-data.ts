'use client'

import { useEffect } from 'react'
import { deepLinkCopy } from '@/content/showroom'
import { readPassSchedulePhase } from '@/lib/collection/pass-collection'
import { usePassCollection } from '@/lib/collection/use-pass-collection'
import { readDeepLinkDesignNumber } from '@/lib/find-sneaker'
import { visitStore } from '@/lib/visit-store'
import { HERO_DESIGN_NUMBER } from '@/store/sneaker-placements'
import { walkController } from './walk-controller'

// The visit's data from outside the store: the deep link (`?pass=137`, brief §10) and what the
// counter's screen shows (brief §10, #2).

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

/**
 * #0137 until the schedule reaches the waitlist window, then the newest confirmed mint. Before the
 * window the deployer's test pass doesn't count, so recent mints are ignored (D-063 §10, #2).
 */
export function useCounterScreenDesign(): void {
  const { collection } = usePassCollection()
  useEffect(() => {
    const phase = readPassSchedulePhase(collection, new Date())
    const newestMint = phase === 'preview' ? undefined : collection?.recentMints[0]
    const nextScreen =
      newestMint === undefined
        ? { designNumber: HERO_DESIGN_NUMBER, founderNumber: null }
        : { designNumber: newestMint.designNumber, founderNumber: newestMint.founderNumber }
    const { counterScreen } = visitStore.read()
    if (
      counterScreen.designNumber !== nextScreen.designNumber ||
      counterScreen.founderNumber !== nextScreen.founderNumber
    ) {
      visitStore.update({ counterScreen: nextScreen })
    }
  }, [collection])
}
