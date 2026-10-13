import type { SoundCue } from '../sound-cues'
import type { SoundEffectKind } from '../soundtrack'
import { readWaitlistSceneStartFrame, toWaitlistBeatFrame, waitlistSceneStartBeats } from './beats'
import { askSceneBeats } from './scenes/AskScene'
import { collectionSceneBeats, readGridRowLandingFrames } from './scenes/CollectionScene'
import { hookSceneBeats } from './scenes/HookScene'
import { passSceneBeats } from './scenes/PassScene'
import { promiseLineBeats } from './scenes/PromiseScene'

// Every sound effect in the waitlist film, in film frames, from the same beats the picture uses
// (docs/waitlist-video-prompt.md §3): a low thump on each flip, a soft tick as each grid row and
// each small thing lands, the button's tap, and one clean tone on "You're on the list."

/** The film's audio files in public/audio/ (gitignored), made by scripts/fetch-audio.sh. */
export const WAITLIST_MUSIC_FILE_NAME = 'waitlist-music.wav'

export const waitlistSoundEffectFiles: Record<SoundEffectKind, string> = {
  tick: 'sfx-tick.wav',
  thump: 'sfx-thump.wav',
  tap: 'sfx-tap.wav',
  tone: 'waitlist-sfx-tone.wav',
}

/** A beat of the whole film, as its frame. */
const atBeat = (beat: number) => toWaitlistBeatFrame(beat)

export const waitlistSoundCues: readonly SoundCue[] = buildWaitlistSoundCues()

function buildWaitlistSoundCues(): SoundCue[] {
  const collectionStart = readWaitlistSceneStartFrame('collection')
  const { collection, pass, promise, ask } = waitlistSceneStartBeats

  const cue = (kind: SoundEffectKind, frame: number): SoundCue => ({ kind, frame })
  const cues: SoundCue[] = [
    // The lime heel tab lands, last of the hook.
    cue('tick', atBeat(hookSceneBeats.limeTab)),
    // Black ↔ off-white flips.
    cue('thump', atBeat(collection)),
    cue('thump', atBeat(collection + collectionSceneBeats.legendaryFlip)),
    cue('thump', atBeat(pass)),
    cue('thump', atBeat(pass + passSceneBeats.founderSneakerFlip)),
    cue('thump', atBeat(promise)),
    cue('thump', atBeat(ask + askSceneBeats.endCardFlip)),
    // Each grid row lands; the punch-in cut; the LACED label.
    ...readGridRowLandingFrames().map((frame) => cue('tick', collectionStart + frame)),
    cue('tick', atBeat(collection + collectionSceneBeats.punchIn)),
    cue('tick', atBeat(pass + passSceneBeats.lacedLabel)),
    // The second and third promise (the first lands on the flip's thump).
    ...promiseLineBeats.slice(1).map((beat) => cue('tick', atBeat(promise + beat))),
    // The form: the address fills, the button presses, the panel answers.
    cue('tick', atBeat(ask + askSceneBeats.fieldFill)),
    cue('tap', atBeat(ask + askSceneBeats.press)),
    cue('tone', atBeat(ask + askSceneBeats.joined)),
  ]
  return cues.sort((first, second) => first.frame - second.frame)
}

/** The music fades out under the end card, from its brand beat to silence on the last frame. */
export const WAITLIST_MUSIC_FADE_OUT_START_FRAME = atBeat(
  waitlistSceneStartBeats.ask + askSceneBeats.endCardBrand,
)
