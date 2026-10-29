import { Audio } from '@remotion/media'
import { interpolate, Sequence, staticFile } from 'remotion'
import {
  MUSIC_DROP_SECONDS,
  PASS_MINT_MUSIC_FILE_NAME,
  passMintSoundCues,
  passMintSoundFiles,
  passMintSoundVolumes,
} from '../sound-cues'
import {
  hookFlipFrame,
  hookTimeline,
  PASS_MINT_DURATION_IN_FRAMES,
  PASS_MINT_FRAMES_PER_SECOND,
  revealFlipFrame,
  rewindTimeline,
} from '../timeline'

// The music in two parts, each placed so the drop lands on a flip: the hook plays the drop and
// cuts dead as the rewind starts; the steps start in the track's bass-less stretch so the drop
// comes back exactly on the reveal's flip, and it plays on to a fade over the end card.

/** Each part starts a frame early, so the drop's kick keeps its whole attack. */
const KICK_LEAD_FRAMES = 1
const MUSIC_CUT_FRAMES = 2
const MUSIC_FADE_IN_FRAMES = 6
const MUSIC_FADE_OUT_FRAMES = 72
/** The steps' bass-less stretch comes up this much, easing back for the drop. */
const BUILD_LIFT_DECIBELS = 2

function readTrackFrameAtFilmFrame(dropFilmFrame: number, filmFrame: number): number {
  return Math.round(MUSIC_DROP_SECONDS * PASS_MINT_FRAMES_PER_SECOND) + filmFrame - dropFilmFrame
}

export function PassMintSoundtrack() {
  const musicSource = staticFile(`audio/${PASS_MINT_MUSIC_FILE_NAME}`)
  const stepsStartFrame = rewindTimeline.endFrame
  const buildGain = 10 ** (BUILD_LIFT_DECIBELS / 20)
  return (
    <>
      <Sequence name="Music: the hook" durationInFrames={hookTimeline.endFrame} layout="none">
        <Audio
          src={musicSource}
          trimBefore={readTrackFrameAtFilmFrame(hookFlipFrame, 0)}
          volume={(frame) =>
            interpolate(
              frame,
              [hookTimeline.endFrame - MUSIC_CUT_FRAMES, hookTimeline.endFrame],
              [1, 0],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
            )
          }
        />
      </Sequence>
      <Sequence
        name="Music: the steps to the end"
        from={stepsStartFrame}
        durationInFrames={PASS_MINT_DURATION_IN_FRAMES - stepsStartFrame}
        layout="none"
      >
        <Audio
          src={musicSource}
          trimBefore={
            readTrackFrameAtFilmFrame(revealFlipFrame, stepsStartFrame) - KICK_LEAD_FRAMES
          }
          volume={(frame) => {
            const filmFrame = stepsStartFrame + frame
            const fadeIn = interpolate(frame, [0, MUSIC_FADE_IN_FRAMES], [0, 1], {
              extrapolateRight: 'clamp',
            })
            const lift = interpolate(
              filmFrame,
              [revealFlipFrame - 30, revealFlipFrame],
              [buildGain, 1],
              {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              },
            )
            const fadeOut = interpolate(
              filmFrame,
              [PASS_MINT_DURATION_IN_FRAMES - MUSIC_FADE_OUT_FRAMES, PASS_MINT_DURATION_IN_FRAMES],
              [1, 0],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
            )
            return fadeIn * lift * fadeOut
          }}
        />
      </Sequence>
      {passMintSoundCues.map((cue) => (
        <Sequence
          key={`${cue.kind}-${cue.frame}`}
          name={`SFX ${cue.kind}`}
          from={cue.frame}
          layout="none"
        >
          <Audio
            src={staticFile(`audio/${passMintSoundFiles[cue.kind]}`)}
            volume={passMintSoundVolumes[cue.kind]}
          />
        </Sequence>
      ))}
    </>
  )
}
