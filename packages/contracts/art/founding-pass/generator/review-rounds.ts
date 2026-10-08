/**
 * Yash's review of the 1,000 designs (Part 1b): each round lists the design numbers he marked on
 * the contact sheets. The build re-rolls them in order, so the same rounds always give the same
 * collection. Add a round, rebuild, and send him the new sheets.
 */
export type ReviewRound = {
  /** The day Yash marked them, `YYYY-MM-DD`. */
  markedOn: string
  designNumbers: readonly number[]
}

export const REVIEW_ROUNDS: readonly ReviewRound[] = []

/**
 * Set to the day Yash approves all ten sheets. From then on the design table is final: the
 * build writes it as frozen, and no round may follow.
 */
export const DESIGNS_FROZEN_ON: string | null = null
