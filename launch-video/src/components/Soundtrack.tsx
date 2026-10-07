import { Audio } from '@remotion/media'
import { interpolate, Sequence, staticFile } from 'remotion'
import { FILM_DURATION_IN_FRAMES, readSceneStartFrame, toSceneBeatFrame } from '../beats'
import { soundCues } from '../sound-cues'
import {
  DUCKING_DEPTH_DECIBELS,
  DUCKING_SOUND_EFFECT_KINDS,
  MUSIC_FILE_NAME,
  type SoundEffectKind,
  soundEffectFileNames,
  soundEffectVolumes,
} from '../soundtrack'

// music.wav is already levelled to −19 LUFS by scripts/fetch-audio.sh, so the effects sit the same
// way over any track; scripts/render.sh then brings the whole mix to −14 LUFS.
const MUSIC_GAIN = 1
const FADE_IN_FRAMES = 3
/** The music fades from the end card's beat 2 ("Upgrade.") to silence on the last frame. */
const FADE_OUT_START_BEAT = 2
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

const duckingCues = soundCues.filter((cue) => DUCKING_SOUND_EFFECT_KINDS.includes(cue.kind))

/** The music under the whole film, plus every sound effect from sound-cues.ts. */
export function Soundtrack() {
  return (
    <>
      <Audio
        name="Music"
        src={staticFile(`audio/${MUSIC_FILE_NAME}`)}
        durationInFrames={FILM_DURATION_IN_FRAMES}
        volume={readMusicVolume}
      />
      {soundCues.map((cue) => (
        <Sequence
          key={`${cue.kind}-${cue.frame}`}
          name={`SFX ${cue.kind}`}
          from={cue.frame}
          layout="none"
        >
          <Audio
            src={staticFile(`audio/${soundEffectFileNames[cue.kind]}`)}
            volume={soundEffectVolumes[cue.kind]}
          />
        </Sequence>
      ))}
    </>
  )
}

/** The music's gain at a film frame: faded in and out, and ducked under the key effects. */
function readMusicVolume(frame: number): number {
  const fadeOutStartFrame =
    readSceneStartFrame('endCard') + toSceneBeatFrame('endCard', FADE_OUT_START_BEAT)
  const fadeOutDecibels = interpolate(
    frame,
    [fadeOutStartFrame, FILM_DURATION_IN_FRAMES - 1],
    [0, FADE_OUT_FLOOR_DECIBELS],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  )
  const fadeIn = interpolate(frame, [0, FADE_IN_FRAMES], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const fadeOut = frame >= FILM_DURATION_IN_FRAMES - 1 ? 0 : toGain(fadeOutDecibels)
  return MUSIC_GAIN * fadeIn * fadeOut * toGain(-readDuckingDecibels(frame))
}

function readDuckingDecibels(frame: number): number {
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
