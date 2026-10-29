// The One thing film's frames (docs/one-thing-video-prompt.md, "The cut"). The hook and the three
// reveal shots sit on the reference's own cuts (../menWantOneThing.mp4, measured frame by frame), at
// its own 30 fps, so the film stays on its music. Only the end card is the film's own: it holds the
// waitlist line over the music's loop (scripts/copy-one-thing-media.sh).

export const ONE_THING_FRAMES_PER_SECOND = 30
export const ONE_THING_WIDTH = 1080
export const ONE_THING_HEIGHT = 1920
/** The reference's 369 frames, then a 120-frame end card (16.3 s in all). */
export const ONE_THING_DURATION_IN_FRAMES = 489

/**
 * The reference's hook, played as it is: "Men only want one thing, and it's not money, it's not
 * power, it's not love," up to its own cut to the land (5.17 s). Its voice stops at 5.0 s, before
 * the second voice's "it's 418 square meters of land" (scripts/copy-one-thing-media.sh).
 */
export const HOOK_END_FRAME = 155

export type RevealShotName = 'strideMon' | 'sneaker' | 'free'

/**
 * Each reveal shot from its first frame up to (not including) its end frame, on the reference's
 * cuts: "418m²" over the plot, "OF LAND" from the air, then "R3,500,000 📍 HOUT BAY".
 */
export const revealShots: Record<RevealShotName, { startFrame: number; endFrame: number }> = {
  strideMon: { startFrame: HOOK_END_FRAME, endFrame: 225 },
  sneaker: { startFrame: 225, endFrame: 300 },
  free: { startFrame: 300, endFrame: 369 },
}

export const revealShotNames = Object.keys(revealShots) as RevealShotName[]

/** "STRIDEMON" sparkles in as the reference's "418m²": streaks of light that settle into letters. */
export const SPARKLE_IN_FRAMES = 12

/** The end card: the lockup, then the waitlist line one part at a time, held to the end. */
export const endCardTimeline = {
  startFrame: 369,
  lockupInEndFrame: 377,
  headlineInFrame: 380,
  bodyInFrame: 392,
  linkInFrame: 404,
} as const

export function readRevealShotAtFrame(frame: number): RevealShotName | null {
  return (
    revealShotNames.find(
      (shotName) =>
        frame >= revealShots[shotName].startFrame && frame < revealShots[shotName].endFrame,
    ) ?? null
  )
}
