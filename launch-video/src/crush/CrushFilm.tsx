import { Audio, Video } from '@remotion/media'
import type { ReactNode } from 'react'
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion'
import { useSvgMarkups } from '../components/svg-markup'
import { FilmGrain } from '../showroom/components/FilmGrain'
import { BenchText } from './components/BenchText'
import { LogoCard } from './components/LogoCard'
import { PlacedSneaker } from './components/PlacedSneaker'
import { readBenchFirstPose, readBenchSecondPose, readHookPose, readShotPose } from './poses'
import { type CssMatrix, crushTracks } from './tracks'
import {
  benchTimeline,
  type CrushShotName,
  crushShots,
  HOOK_END_FRAME,
  HOOK_PAN_END_FRAME,
  HOOK_PAN_START_FRAME,
  readShotAtFrame,
  REFERENCE_HEIGHT,
  REFERENCE_TO_FILM_SCALE,
  REFERENCE_WIDTH,
} from './timeline'

// The Crush film (docs/crush-video-prompt.md): the reference's own video, frame for frame, with
// #0137 Rose Hiker Night in place of its cup. The hook is the reference's footage untouched; from
// the cup's first frame, every shot is the reference's own background with the cup taken out (a
// clean plate, scripts/build-crush-plates.py), moved by the reference's own tracked camera, with
// the Sneaker where the cup was. Then the words and the logo, as the reference's. To the
// reference's own music. 1080 × 1920, 25 fps, 634 frames.

/**
 * The reference's own music, untouched (Yash, 2026-10-23; unlicensed, so not for Instagram:
 * CREDITS.md). scripts/copy-crush-media.sh extracts it.
 */
export const CRUSH_MUSIC_FILE_NAME = 'crush-music.wav'
export const CRUSH_SNEAKER_PATH = staticFile('crush/sneaker-0137.svg')

export type CrushFilmProps = {
  /** In public/audio/; null for a silent picture. */
  musicFileName: string | null
}

export const defaultCrushProps: CrushFilmProps = {
  musicFileName: CRUSH_MUSIC_FILE_NAME,
}

const IDENTITY: CssMatrix = [1, 0, 0, 1, 0, 0]
/** A slow push-in on every short shot, from a little in so a tracked shift never shows an edge. */
const PUSH_IN_START_SCALE = 1.03
const PUSH_IN_END_SCALE = 1.06
/**
 * The bench close-up: the reference tilts up its tall cup, and the Sneaker is less than half as
 * tall, so the tilt is kept to this share of the reference's while the camera is close (it hands
 * back to the reference's own move as it pulls out). The Sneaker's middle is at y 763 on the plate,
 * where the reference's view centre is on frame 408 (782).
 */
const BENCH_TILT_SHARE = 0.45
const BENCH_SNEAKER_CENTER_Y = 763
const BENCH_CLOSE_VIEW_CENTER_Y = 782
const BENCH_CLOSEST_ZOOM = 3.05

/** a ∘ b: b first, then a. */
function multiplyMatrices(a: CssMatrix, b: CssMatrix): CssMatrix {
  const [a0, a1, a2, a3, a4, a5] = a
  const [b0, b1, b2, b3, b4, b5] = b
  return [
    a0 * b0 + a2 * b1,
    a1 * b0 + a3 * b1,
    a0 * b2 + a2 * b3,
    a1 * b2 + a3 * b3,
    a0 * b4 + a2 * b5 + a4,
    a1 * b4 + a3 * b5 + a5,
  ]
}

function readTrackMatrix(shotName: CrushShotName, frame: number): CssMatrix {
  const matrices = crushTracks[shotName]
  const index = Math.min(matrices.length - 1, Math.max(0, frame - crushShots[shotName].startFrame))
  return matrices[index] ?? IDENTITY
}

/** The camera for a shot: the reference's tracked move, fitted to the Sneaker where needed. */
function readCameraMatrix(shotName: CrushShotName, frame: number): CssMatrix {
  const tracked = readTrackMatrix(shotName, frame)
  if (shotName === 'hookFloat') return tracked
  if (shotName === 'bench') {
    const [a, b, c, d, e, f] = tracked
    const zoom = Math.hypot(a, b)
    const viewCenterY = (REFERENCE_HEIGHT / 2 - f) / zoom
    const closeness = Math.min(1, Math.max(0, (zoom - 1) / (BENCH_CLOSEST_ZOOM - 1)))
    const fittedCenterY = BENCH_SNEAKER_CENTER_Y + (viewCenterY - BENCH_CLOSE_VIEW_CENTER_Y) * BENCH_TILT_SHARE
    const centerY = viewCenterY + closeness * (fittedCenterY - viewCenterY)
    return [a, b, c, d, e, REFERENCE_HEIGHT / 2 - centerY * zoom]
  }
  const { startFrame, endFrame } = crushShots[shotName]
  const scale = interpolate(frame, [startFrame, endFrame - 1], [PUSH_IN_START_SCALE, PUSH_IN_END_SCALE])
  const pushIn: CssMatrix = [scale, 0, 0, scale, (REFERENCE_WIDTH / 2) * (1 - scale), (REFERENCE_HEIGHT / 2) * (1 - scale)]
  return multiplyMatrices(pushIn, tracked)
}

/** The reference's 720 × 1280 frame, scaled to the film: everything inside is in its pixels. */
function ReferenceFrame({ matrix = IDENTITY, children }: { matrix?: CssMatrix; children: ReactNode }) {
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: REFERENCE_WIDTH,
          height: REFERENCE_HEIGHT,
          transformOrigin: '0 0',
          transform: `scale(${REFERENCE_TO_FILM_SCALE}) matrix(${matrix.join(', ')})`,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  )
}

function Plate({ name }: { name: string }) {
  return (
    <Img
      src={staticFile(`crush/plates/${name}.png`)}
      style={{ position: 'absolute', left: 0, top: 0, width: REFERENCE_WIDTH, height: REFERENCE_HEIGHT }}
    />
  )
}

/** The hook's pan (264–270): each frame's own plate, the Sneaker where that frame's cup was. */
function HookPan({ markup }: { markup: string }) {
  const frame = useCurrentFrame()
  return (
    <ReferenceFrame>
      <Plate name={`hookPan${frame}`} />
      <PlacedSneaker markup={markup} pose={readHookPose(frame)} idPrefix="hook" frame={frame} />
    </ReferenceFrame>
  )
}

/** One plate shot: its plate and its Sneakers, carried together by the reference's camera. */
function PlateShot({ markup, shotName }: { markup: string; shotName: CrushShotName }) {
  const frame = useCurrentFrame()
  let sneakers: ReactNode
  if (shotName === 'hookFloat') {
    sneakers = <PlacedSneaker markup={markup} pose={readHookPose(frame)} idPrefix="hook" frame={frame} />
  } else if (shotName === 'bench') {
    const secondPose = readBenchSecondPose(frame)
    sneakers = (
      <>
        {secondPose === null ? null : <PlacedSneaker markup={markup} pose={secondPose} idPrefix="pair-second" frame={frame} />}
        <PlacedSneaker markup={markup} pose={readBenchFirstPose()} idPrefix="pair-first" frame={frame} />
      </>
    )
  } else {
    sneakers = <PlacedSneaker markup={markup} pose={readShotPose(shotName, frame)} idPrefix={shotName} frame={frame} />
  }
  return (
    <ReferenceFrame matrix={readCameraMatrix(shotName, frame)}>
      <Plate name={shotName} />
      {sneakers}
    </ReferenceFrame>
  )
}

/** From the cup's first frame to the wash to white: the plates, the words and a phone's grain. */
function Shots({ markup }: { markup: string }) {
  const frame = useCurrentFrame()
  const shotName = readShotAtFrame(frame)
  const whiteWash = interpolate(frame, [benchTimeline.whiteStartFrame, benchTimeline.whiteEndFrame], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  return (
    <AbsoluteFill>
      {frame < HOOK_PAN_END_FRAME ? <HookPan markup={markup} /> : null}
      {shotName === null ? null : <PlateShot markup={markup} shotName={shotName} />}
      <AbsoluteFill style={{ opacity: 0.5 }}>
        <FilmGrain />
      </AbsoluteFill>
      {shotName === 'bench' ? <BenchText /> : null}
      <AbsoluteFill style={{ backgroundColor: '#FFFFFF', opacity: whiteWash }} />
    </AbsoluteFill>
  )
}

export function CrushFilm({ musicFileName }: CrushFilmProps) {
  const frame = useCurrentFrame()
  const markups = useSvgMarkups([CRUSH_SNEAKER_PATH])
  const markup = markups?.get(CRUSH_SNEAKER_PATH)
  const isShotFrame = frame >= HOOK_PAN_START_FRAME && frame < crushShots.bench.endFrame
  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      <Sequence durationInFrames={HOOK_END_FRAME} name="Hook (the reference's footage)">
        <Video src={staticFile('crush/reference.mp4')} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </Sequence>
      {markup !== undefined && isShotFrame ? <Shots markup={markup} /> : null}
      {frame >= crushShots.bench.endFrame ? <LogoCard /> : null}
      {musicFileName === null ? null : <Audio src={staticFile(`audio/${musicFileName}`)} />}
    </AbsoluteFill>
  )
}
