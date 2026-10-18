import { appTourTaps } from './components/PhoneScreen'
import { levelUpTimeline } from './timeline'

// The App tour film's sound effects, over its music (Yash, STOP 2: keep the effects, but no whoosh
// on the wipes): a light tap on each ring and one hit on "Level 2 reached". Both files are ones the
// other films already use and CREDITS.md already lists (scripts/fetch-audio.sh makes them).

export const appTourSoundFiles = {
  tap: 'sfx-tap.wav',
  hit: 'pass-chat-sfx-boom.wav',
} as const

export type AppTourSoundKind = keyof typeof appTourSoundFiles

/** Each effect's gain over music levelled to −19 LUFS (scripts/fetch-audio.sh). */
export const appTourSoundVolumes: Record<AppTourSoundKind, number> = {
  /** Kenney's click: light. */
  tap: 0.7,
  /** "Cinematic Boom", −0.9 dBFS peak: on the drop, with the music. */
  hit: 0.5,
}

/** How far into each file its peak falls, in frames, so the peak lands on its picture frame. */
const PEAK_FRAMES: Record<AppTourSoundKind, number> = { tap: 0, hit: 1 }

export type AppTourSoundCue = { kind: AppTourSoundKind; frame: number }

export const appTourSoundCues: readonly AppTourSoundCue[] = [
  ...appTourTaps.map((tap) => ({ kind: 'tap' as const, frame: tap.frame })),
  { kind: 'hit' as const, frame: levelUpTimeline.dropFrame },
]
  .map((cue) => ({ ...cue, frame: Math.max(0, cue.frame - PEAK_FRAMES[cue.kind]) }))
  .sort((first, second) => first.frame - second.frame)
