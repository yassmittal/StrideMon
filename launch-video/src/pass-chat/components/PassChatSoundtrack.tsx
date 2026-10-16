import { Audio } from '@remotion/media'
import { interpolate, Sequence, staticFile } from 'remotion'
import {
  type PassChatSoundCue,
  passChatSoundCues,
  passChatSoundFiles,
  passChatSoundVolumes,
} from '../sound-cues'
import {
  burstTimeline,
  PASS_CHAT_DURATION_IN_FRAMES,
  ringTimeline,
  spinTimeline,
  writeTimeline,
} from '../timeline'

// The Pass chat film's sound: the music up front, cut like an edit, with every cue in sound-cues.ts
// on top. The music file (levelled to −19 LUFS by scripts/fetch-audio.sh) starts so its drop lands
// on the spin's whip into the card. It plays to the flip to black and stops dead there, under the
// boom; the pen writes over the boom's tail; then the drop plays again from "a JPEG." and fades out
// over the end card.

/** The film frame the music's drop lands on, which is also its frame in the file. */
const MUSIC_DROP_FRAME = spinTimeline.endFrame
/** The drop comes back here, as "a JPEG." slides in. */
const MUSIC_RETURN_FRAME = writeTimeline.slideStartFrame
/** Each music part starts a frame early, so the drop's kick keeps its whole attack. */
const KICK_LEAD_FRAMES = 1
const MUSIC_FADE_IN_FRAMES = 6
/** The chat's stretch of the track, before the drop, comes up this much, easing back for the drop. */
const BUILD_LIFT_DECIBELS = 2
const BUILD_LIFT_RELEASE_FRAMES = 30
/** The music dips this much as the shoes burst out, so the burst's whoosh stands clear. */
const BURST_DIP_DECIBELS = 4
const BURST_DIP_HOLD_FRAMES = 12
const BURST_DIP_RELEASE_FRAMES = 18
/** The cut to silence takes two frames, so it never clicks. */
const MUSIC_CUT_FRAMES = 2
const MUSIC_FADE_OUT_FRAMES = 72
/** A cut sound fades out over its last frames, as the pen lifts. */
const CUT_FADE_FRAMES = 3

export function PassChatSoundtrack({
  musicFileName,
}: {
  /** In public/audio/. */
  musicFileName: string
}) {
  const musicSource = staticFile(`audio/${musicFileName}`)
  const returnStartFrame = MUSIC_RETURN_FRAME - KICK_LEAD_FRAMES
  return (
    <>
      <Sequence name="Music to the flip" durationInFrames={ringTimeline.flipFrame} layout="none">
        <Audio src={musicSource} volume={readBuildGain} />
      </Sequence>
      <Sequence
        name="Music from a JPEG."
        from={returnStartFrame}
        durationInFrames={PASS_CHAT_DURATION_IN_FRAMES - returnStartFrame}
        layout="none"
      >
        <Audio
          src={musicSource}
          trimBefore={MUSIC_DROP_FRAME - KICK_LEAD_FRAMES}
          volume={(frame) => readReturnGain(returnStartFrame + frame)}
        />
      </Sequence>
      {passChatSoundCues.map((cue) => (
        <Sequence
          key={`${cue.kind}-${cue.frame}`}
          name={`SFX ${cue.kind}`}
          from={cue.frame}
          layout="none"
          {...(cue.durationInFrames === undefined
            ? {}
            : { durationInFrames: cue.durationInFrames })}
        >
          <Audio
            src={staticFile(`audio/${passChatSoundFiles[cue.kind]}`)}
            {...(cue.trimBeforeFrames === undefined ? {} : { trimBefore: cue.trimBeforeFrames })}
            volume={(frame) => readCueGain(cue, frame)}
          />
        </Sequence>
      ))}
    </>
  )
}

function readCueGain(cue: PassChatSoundCue, frameInCue: number): number {
  const level = passChatSoundVolumes[cue.kind]
  if (cue.durationInFrames === undefined) return level
  return (
    level *
    interpolate(
      frameInCue,
      [cue.durationInFrames - CUT_FADE_FRAMES, cue.durationInFrames],
      [1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
    )
  )
}

/**
 * Up to the flip: in over a few frames, lifted under the chat (the track's part before the drop is
 * much lighter), down under the burst so its whoosh reads, and out in two frames at the cut.
 */
function readBuildGain(frame: number): number {
  const envelope = interpolate(
    frame,
    [0, MUSIC_FADE_IN_FRAMES, ringTimeline.flipFrame - MUSIC_CUT_FRAMES, ringTimeline.flipFrame],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  )
  const buildLift = interpolate(
    frame,
    [MUSIC_DROP_FRAME - BUILD_LIFT_RELEASE_FRAMES, MUSIC_DROP_FRAME],
    [BUILD_LIFT_DECIBELS, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  )
  const burstDip = interpolate(
    frame,
    [
      burstTimeline.firstShoeFrame - 2,
      burstTimeline.firstShoeFrame,
      burstTimeline.firstShoeFrame + BURST_DIP_HOLD_FRAMES,
      burstTimeline.firstShoeFrame + BURST_DIP_HOLD_FRAMES + BURST_DIP_RELEASE_FRAMES,
    ],
    [0, BURST_DIP_DECIBELS, BURST_DIP_DECIBELS, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  )
  return envelope * toGain(buildLift - burstDip)
}

function toGain(decibels: number): number {
  return 10 ** (decibels / 20)
}

/** From "a JPEG.": full, then out over the end card's last stretch. */
function readReturnGain(filmFrame: number): number {
  return interpolate(
    filmFrame,
    [PASS_CHAT_DURATION_IN_FRAMES - MUSIC_FADE_OUT_FRAMES, PASS_CHAT_DURATION_IN_FRAMES - 1],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  )
}
