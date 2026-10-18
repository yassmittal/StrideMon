// The App tour film's grid: every timed moment in timeline.ts is a beat on it, so retiming the film
// to a new track means changing these two numbers (docs/app-tour-video-prompt.md §2).
//
// It's the film's music's grid, the reference ad's own track (reference.md, "The music"): 100.01
// BPM, the first beat at 0.690 s. At 60 fps a beat is 36 frames. Beats before the first one are
// negative (the icon).

export const APP_TOUR_FRAMES_PER_SECOND = 60
export const APP_TOUR_WIDTH = 1080
export const APP_TOUR_HEIGHT = 1920
/** 30 s, as the reference. */
export const APP_TOUR_DURATION_IN_FRAMES = 1800

export const APP_TOUR_BEATS_PER_MINUTE = 100
export const APP_TOUR_FIRST_BEAT_SECONDS = 0.69

export const APP_TOUR_FRAMES_PER_BEAT =
  (60 / APP_TOUR_BEATS_PER_MINUTE) * APP_TOUR_FRAMES_PER_SECOND

/** The film frame of a beat (fractional beats too), rounded to a whole frame. */
export function toBeatFrame(beat: number): number {
  return Math.round(toBeatFrameExact(beat))
}

/** The same, unrounded: for curves that span beats. */
function toBeatFrameExact(beat: number): number {
  return APP_TOUR_FIRST_BEAT_SECONDS * APP_TOUR_FRAMES_PER_SECOND + beat * APP_TOUR_FRAMES_PER_BEAT
}

export function secondsToFrames(seconds: number): number {
  return Math.round(seconds * APP_TOUR_FRAMES_PER_SECOND)
}
