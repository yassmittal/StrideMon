'use client'

import { plannedPassScheduleTimes } from '@/content/founding-pass'
import { useNow } from '../use-now'
import type { PassCollection } from './pass-collection'
import {
  calculatePassSchedulePosition,
  type PassSchedulePosition,
  type PassScheduleTimes,
} from './pass-schedule'
import { usePassCollection } from './use-pass-collection'

export type PassScheduleView = {
  /** The API's times once it answers, the planned ones until then (D-044). */
  scheduleTimes: PassScheduleTimes
  /** Null until the page knows the time (never in the static HTML). */
  position: PassSchedulePosition | null
  now: Date | null
  collection: PassCollection | null
}

export function usePassSchedule(intervalMilliseconds: number): PassScheduleView {
  const { collection } = usePassCollection()
  const now = useNow(intervalMilliseconds)
  const scheduleTimes = collection?.scheduleTimes ?? plannedPassScheduleTimes
  const position =
    now === null
      ? null
      : calculatePassSchedulePosition({
          scheduleTimes,
          mintedCount: collection?.mintedCount ?? null,
          now,
        })
  return { scheduleTimes, position, now, collection }
}
