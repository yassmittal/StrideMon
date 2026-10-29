import {
  emailCutFrame,
  endCardTimeline,
  PASS_MINT_FRAMES_PER_SECOND,
  readStepFrameAtRecordingSeconds,
  recordingClickSeconds,
  revealFlipFrame,
  rewindTimeline,
  stepTimelines,
} from './timeline'

// The Pass mint film's sound, in film frames, from the same timeline the picture uses. The music is
// "Brazilian Phonk" (the Pass chat film's track, CREDITS.md), up front and cut like an edit: its drop
// under the hook, cut dead for the rewind, its lighter, bass-less stretch under the four steps,
// and the drop again on the reveal's flip. The effects are the Pass chat film's Pixabay set and
// Kenney's click.

/** The whole track, levelled to −19 LUFS by scripts/fetch-audio.sh, from its own 0 s. */
export const PASS_MINT_MUSIC_FILE_NAME = 'pass-mint-music.wav'
/**
 * The track's drop: its first kick after the bass-less stretch. The Pass chat film's 58.850 s is
 * where the kick starts; the low end peaks at 58.93 s, measured in this film's mix, so that's the
 * frame that lands on the flip.
 */
export const MUSIC_DROP_SECONDS = 58.93

export const passMintSoundFiles = {
  click: 'sfx-tap.wav',
  whip: 'pass-chat-sfx-whip.wav',
  whooshIn: 'pass-chat-sfx-whoosh-in.wav',
  pop: 'pass-chat-sfx-pop-sent.wav',
  slide: 'pass-chat-sfx-slide.wav',
  riser: 'pass-chat-sfx-riser.wav',
  pill: 'pass-chat-sfx-pill.wav',
} as const

export type PassMintSoundKind = keyof typeof passMintSoundFiles

/** Each sound's gain over the music at −19 LUFS (the Pass chat film's levels, which Yash heard). */
export const passMintSoundVolumes: Record<PassMintSoundKind, number> = {
  click: 0.9,
  whip: 0.65,
  whooshIn: 0.52,
  pop: 0.7,
  slide: 0.8,
  riser: 1.4,
  pill: 0.6,
}

export type PassMintSoundCue = { kind: PassMintSoundKind; frame: number }

/** The riser runs 1.84 s and peaks at its end: it starts so it peaks on the reveal's flip. */
const RISER_LENGTH_FRAMES = Math.round(1.84 * PASS_MINT_FRAMES_PER_SECOND)

export const passMintSoundCues: readonly PassMintSoundCue[] = [
  // The rewind: a whip as the tape winds back, a whoosh as it lands on the start.
  { kind: 'whip', frame: rewindTimeline.startFrame - 2 },
  { kind: 'whooshIn', frame: rewindTimeline.endFrame - 8 },
  // Each step's caption and tracker pill.
  ...Object.values(stepTimelines).map(({ startFrame }) => ({
    kind: 'pop' as const,
    frame: startFrame,
  })),
  // The jump over the wait for the code.
  { kind: 'slide', frame: emailCutFrame - 3 },
  ...recordingClickSeconds.map((seconds) => ({
    kind: 'click' as const,
    frame: readStepFrameAtRecordingSeconds(seconds),
  })),
  { kind: 'riser', frame: revealFlipFrame - RISER_LENGTH_FRAMES },
  { kind: 'pill', frame: endCardTimeline.pillFrame },
]
