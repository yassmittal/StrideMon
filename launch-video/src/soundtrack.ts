// The film's audio files in public/audio/ (gitignored), made by scripts/fetch-audio.sh.
// Sources and licences: CREDITS.md.

/**
 * "Blue Coast" by Loksii (Pixabay), 120 BPM, trimmed by fetch-audio.sh so a downbeat is at 0 s.
 * Its intro builds under the intro and step 1, a one-bar break falls as step 1 ends, and the drop
 * lands on frame 600, the walk's first beat.
 */
export const MUSIC_FILE_NAME = 'music.wav'

export const soundEffectFileNames = {
  /** A counter's last digit lands. */
  tick: 'sfx-tick.wav',
  /** A section flips between black and off-white. */
  thump: 'sfx-thump.wav',
  /** A finger on the STOP pill. */
  tap: 'sfx-tap.wav',
  /** +10 STRIDE lands. */
  tone: 'sfx-tone.wav',
} as const

export type SoundEffectKind = keyof typeof soundEffectFileNames

/**
 * Each effect's gain (0–1) over the levelled music (−19 LUFS, scripts/fetch-audio.sh), set for a
 * beat-driven track: each effect stands a few dB clear of the music in its own band. A calm, sparse
 * track wants them lower (about tick 0.09, thump 0.3, tap 0.45, tone 0.22).
 */
export const soundEffectVolumes: Record<SoundEffectKind, number> = {
  tick: 0.3,
  thump: 0.5,
  tap: 0.65,
  tone: 0.25,
}

/** The music ducks under these effects (launch-video-prompt.md §5). */
export const DUCKING_SOUND_EFFECT_KINDS: readonly SoundEffectKind[] = ['thump', 'tap', 'tone']
export const DUCKING_DEPTH_DECIBELS = 4
