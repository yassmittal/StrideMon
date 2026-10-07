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
 * Each effect's gain (0–1) over the levelled music (−19 LUFS, scripts/fetch-audio.sh). The music is
 * calm and warm, so the effects stay soft: about 8–12 dB above the music in their own band, enough
 * to feel, never to startle.
 */
export const soundEffectVolumes: Record<SoundEffectKind, number> = {
  tick: 0.09,
  thump: 0.3,
  tap: 0.45,
  tone: 0.22,
}

/** The music ducks under these effects (launch-video-prompt.md §5). */
export const DUCKING_SOUND_EFFECT_KINDS: readonly SoundEffectKind[] = ['thump', 'tap', 'tone']
export const DUCKING_DEPTH_DECIBELS = 4
