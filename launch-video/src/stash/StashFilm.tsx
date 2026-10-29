import { Audio, Video } from '@remotion/media'
import {
  AbsoluteFill,
  Easing,
  Freeze,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from 'remotion'
import { FilmGrain } from '../showroom/components/FilmGrain'
import { colors, easings, stashColors } from '../theme'
import { CaseSneakers } from './components/CaseSneakers'
import { EndCard } from './components/EndCard'
import {
  caseFadeTimeline,
  END_CARD_DURATION_IN_FRAMES,
  END_CARD_HELD_FRAME,
  END_CARD_START_FRAME,
  endCardTimeline,
  musicTimeline,
  whipTimeline,
} from './timeline'

// The Stash film (docs/stash-video-prompt.md): the "what is bro filming 💀" trend from a press-on
// nail brand's ad (../nailpaints.mp4), with Founding Pass Sneakers in its case. A phone lowered on a
// tape measure through a pavement grate finds, underneath, a case held in a gloved hand: the
// reference's own frames (its credit taken out) up to the case, then its own hand, case and camera
// with the nails taken out (scripts/build-stash-plates.py) and six Sneakers lying in it, carried by
// the case's tracked move. Then the waitlist line. To the reference's own music. 1080 × 1920, 30 fps.

/**
 * The reference's own music (Yash, 2026-10-26; unlicensed, so not for Instagram: CREDITS.md).
 * scripts/copy-stash-media.sh extracts it.
 */
export const STASH_MUSIC_FILE_NAME = 'stash-music.wav'

export type StashFilmProps = {
  /** In public/audio/; null for a silent picture. */
  musicFileName: string | null
}

export const defaultStashProps: StashFilmProps = {
  musicFileName: STASH_MUSIC_FILE_NAME,
}

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
const WHIP_ZOOM_IN_SCALE = 1.9
const WHIP_ZOOM_OUT_SCALE = 1.6
const WHIP_BLUR_PIXELS = 26
const END_CARD_BLUR_PIXELS = 22

/** The reference's frame (cleaned) and the Sneakers in its case, at the frame it's held on. */
function CaseScene() {
  const frame = useCurrentFrame()
  return (
    <AbsoluteFill>
      <Video
        src={staticFile('stash/reference.mp4')}
        muted
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <CaseSneakers trackFrame={frame} />
      <AbsoluteFill style={{ opacity: 0.35 }}>
        <FilmGrain />
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

/**
 * The case fading up from black, on its first well-tracked frame, held. The reference's own fade,
 * measured (0.09 at 199, 0.28 at 201, 0.55 at 203), rises as a square.
 */
function CaseFadeUp() {
  const frame = useCurrentFrame()
  const fade = interpolate(
    frame,
    [caseFadeTimeline.startFrame - 1, caseFadeTimeline.heldFrame],
    [0, 1],
    {
      ...clamp,
      easing: Easing.in(Easing.quad),
    },
  )
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <Freeze frame={caseFadeTimeline.heldFrame}>
        <CaseScene />
      </Freeze>
    </AbsoluteFill>
  )
}

/** The film's own whip between the case's two shots: in and away on shot A, back out on shot B. */
function Whip() {
  const frame = useCurrentFrame()
  const isZoomingIn = frame < whipTimeline.zoomOutStartFrame
  const progress = isZoomingIn
    ? interpolate(
        frame,
        [whipTimeline.zoomInStartFrame - 1, whipTimeline.zoomOutStartFrame - 1],
        [0, 1],
        {
          ...clamp,
          easing: easings.standard,
        },
      )
    : interpolate(frame, [whipTimeline.zoomOutStartFrame, whipTimeline.endFrame], [1, 0], {
        ...clamp,
        easing: easings.outExpo,
      })
  const scale = 1 + progress * ((isZoomingIn ? WHIP_ZOOM_IN_SCALE : WHIP_ZOOM_OUT_SCALE) - 1)
  return (
    <AbsoluteFill
      style={{ transform: `scale(${scale})`, filter: `blur(${progress * WHIP_BLUR_PIXELS}px)` }}
    >
      <Freeze frame={isZoomingIn ? whipTimeline.heldFrameA : whipTimeline.heldFrameB}>
        <CaseScene />
      </Freeze>
    </AbsoluteFill>
  )
}

/** The case's last frame, held, blurring and darkening on the beat under the end card. */
function HeldCase({ endCardFrame }: { endCardFrame: number }) {
  const veil = interpolate(endCardFrame, [0, endCardTimeline.veilEndFrame], [0, 1], {
    ...clamp,
    easing: easings.standard,
  })
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          transform: `scale(${1 + veil * 0.06})`,
          filter: `blur(${veil * END_CARD_BLUR_PIXELS}px)`,
        }}
      >
        <Freeze frame={END_CARD_HELD_FRAME}>
          <CaseScene />
        </Freeze>
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: stashColors.veil, opacity: veil }} />
    </AbsoluteFill>
  )
}

function Music({ musicFileName }: { musicFileName: string }) {
  const src = staticFile(`audio/${musicFileName}`)
  return (
    <>
      <Sequence durationInFrames={END_CARD_START_FRAME} name="Music (the reference's track)">
        <Audio src={src} />
      </Sequence>
      <Sequence
        from={END_CARD_START_FRAME}
        durationInFrames={END_CARD_DURATION_IN_FRAMES}
        name="Music (one bar back)"
      >
        <Audio
          src={src}
          trimBefore={musicTimeline.loopFromFrame}
          volume={(frame) =>
            interpolate(
              frame,
              [musicTimeline.fadeOutStartFrame, END_CARD_DURATION_IN_FRAMES],
              [1, 0],
              clamp,
            )
          }
        />
      </Sequence>
    </>
  )
}

export function StashFilm({ musicFileName }: StashFilmProps) {
  const frame = useCurrentFrame()
  const isFadeUp = frame >= caseFadeTimeline.startFrame && frame < caseFadeTimeline.heldFrame
  const isWhip = frame >= whipTimeline.zoomInStartFrame && frame < whipTimeline.endFrame
  return (
    <AbsoluteFill style={{ backgroundColor: colors.darkBackground }}>
      {frame < END_CARD_START_FRAME && !isFadeUp && !isWhip ? <CaseScene /> : null}
      {isFadeUp ? <CaseFadeUp /> : null}
      {isWhip ? <Whip /> : null}
      {/* Outside the end card's Sequence, so the held frame is the film's own frame number. */}
      {frame >= END_CARD_START_FRAME ? (
        <HeldCase endCardFrame={frame - END_CARD_START_FRAME} />
      ) : null}
      <Sequence from={END_CARD_START_FRAME} name="End card">
        <EndCard />
      </Sequence>
      {musicFileName === null ? null : <Music musicFileName={musicFileName} />}
    </AbsoluteFill>
  )
}
