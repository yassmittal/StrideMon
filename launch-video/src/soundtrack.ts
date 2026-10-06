// The film's audio files in public/audio/ (gitignored), made by scripts/fetch-audio.sh.
// Sources and licences: CREDITS.md.

/**
 * "I Am Techno" by DeltaX-Music (Pixabay), 120 BPM, trimmed by fetch-audio.sh so a downbeat is
 * at 0 s. The breakdown's last four bars play under scenes 1 and 2, and the kick comes back on
 * frame 480, the earn scene's first beat.
 */
export const MUSIC_FILE_NAME = 'music.wav'

export const soundEffectFileNames = {
  /** A counter's last digit lands. */
  tick: 'sfx-tick.wav',
  /** A section flips between black and off-white. */
  thump: 'sfx-thump.wav',
  /** A finger on the STOP pill or MetaMask's Confirm. */
  tap: 'sfx-tap.wav',
  /** +10 SOLE lands. */
  tone: 'sfx-tone.wav',
} as const

export type SoundEffectKind = keyof typeof soundEffectFileNames

/**
 * Each effect's gain (0–1) before the final loudness pass. Set so every effect stands 4–10 dB
 * above the music in its own band, while the mix's peaks stay low enough for loudnorm to reach
 * −14 LUFS at −1 dBTP with a linear gain (no limiting).
 */
export const soundEffectVolumes: Record<SoundEffectKind, number> = {
  tick: 0.22,
  thump: 0.45,
  tap: 0.4,
  tone: 0.35,
}

/** The music ducks under these effects (launch-video-prompt.md §5). */
export const DUCKING_SOUND_EFFECT_KINDS: readonly SoundEffectKind[] = ['thump', 'tap', 'tone']
export const DUCKING_DEPTH_DECIBELS = 4
