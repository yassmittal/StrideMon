import { Audio } from '@remotion/media'
import { interpolate, Sequence, staticFile } from 'remotion'
import type { SoundCue } from '../sound-cues'
import {
  DUCKING_DEPTH_DECIBELS,
  DUCKING_SOUND_EFFECT_KINDS,
  type SoundEffectKind,
  soundEffectVolumes,
} from '../soundtrack'

// Each film's music is already levelled to −19 LUFS by scripts/fetch-audio.sh, so the effects sit
// the same way over any track; scripts/render.sh then brings the whole mix to −14 LUFS.
const MUSIC_GAIN = 1
const FADE_IN_FRAMES = 3
const FADE_OUT_FLOOR_DECIBELS = -40

const DUCK_ATTACK_FRAMES = 2
const DUCK_RELEASE_FRAMES = 15
/** How long each ducking effect holds the music down before it recovers. */
const DUCK_HOLD_FRAMES: Record<SoundEffectKind, number> = {
  tick: 0,
  thump: 6,
  tap: 6,
  tone: 40,
}

type SoundtrackProps = {
  /** In public/audio/. */
  musicFileName: string
  /** Each effect's file in public/audio/. */
  soundEffectFiles: Record<SoundEffectKind, string>
  cues: readonly SoundCue[]
  durationInFrames: number
  /** The music fades from here to silence on the last frame. */
  fadeOutStartFrame: number
}

/** The music under a whole film, plus every sound effect cue. */
export function Soundtrack({
  musicFileName,
  soundEffectFiles,
  cues,
  durationInFrames,
  fadeOutStartFrame,
}: SoundtrackProps) {
  const duckingCues = cues.filter((cue) => DUCKING_SOUND_EFFECT_KINDS.includes(cue.kind))
  return (
    <>
      <Audio
        name="Music"
        src={staticFile(`audio/${musicFileName}`)}
        durationInFrames={durationInFrames}
        volume={(frame) =>
          readMusicVolume({ frame, duckingCues, durationInFrames, fadeOutStartFrame })
        }
      />
      {cues.map((cue) => (
        <Sequence
          key={`${cue.kind}-${cue.frame}`}
          name={`SFX ${cue.kind}`}
          from={cue.frame}
          layout="none"
        >
          <Audio
            src={staticFile(`audio/${soundEffectFiles[cue.kind]}`)}
            volume={soundEffectVolumes[cue.kind]}
          />
        </Sequence>
      ))}
    </>
  )
}

/** The music's gain at a film frame: faded in and out, and ducked under the key effects. */
function readMusicVolume({
  frame,
  duckingCues,
  durationInFrames,
  fadeOutStartFrame,
}: {
  frame: number
  duckingCues: readonly SoundCue[]
  durationInFrames: number
  fadeOutStartFrame: number
}): number {
  const fadeOutDecibels = interpolate(
    frame,
    [fadeOutStartFrame, durationInFrames - 1],
    [0, FADE_OUT_FLOOR_DECIBELS],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  )
  const fadeIn = interpolate(frame, [0, FADE_IN_FRAMES], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const fadeOut = frame >= durationInFrames - 1 ? 0 : toGain(fadeOutDecibels)
  return MUSIC_GAIN * fadeIn * fadeOut * toGain(-readDuckingDecibels(frame, duckingCues))
}

function readDuckingDecibels(frame: number, duckingCues: readonly SoundCue[]): number {
  let depthDecibels = 0
  for (const cue of duckingCues) {
    const holdEndFrame = cue.frame + DUCK_HOLD_FRAMES[cue.kind]
    const amount = interpolate(
      frame,
      [cue.frame - DUCK_ATTACK_FRAMES, cue.frame, holdEndFrame, holdEndFrame + DUCK_RELEASE_FRAMES],
      [0, 1, 1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
    )
    depthDecibels = Math.max(depthDecibels, amount * DUCKING_DEPTH_DECIBELS)
  }
  return depthDecibels
}

function toGain(decibels: number): number {
  return 10 ** (decibels / 20)
}
