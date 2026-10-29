import { Audio, Video } from '@remotion/media'
import type { ReactNode } from 'react'
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion'
import { FilmGrain } from '../showroom/components/FilmGrain'
import { DocText } from './components/DocText'
import { StandingSneaker } from './components/StandingSneaker'
import { rainShots } from './content'
import {
  carShots,
  readCarShotAtFrame,
  REFERENCE_HEIGHT,
  REFERENCE_TO_FILM_SCALE,
  REFERENCE_WIDTH,
  TYPING_END_FRAME,
  TYPING_START_FRAME,
} from './timeline'
import { type CssMatrix, carShotTracks, type RainCarShotName } from './tracks'

// The Rain film (docs/rain-video-prompt.md): the "I always wondered what the rain would say..."
// trend, from the reference's own video, frame for frame. The rain on the keyboard and the whip to
// the laptop are its footage untouched; then the rain types WAITLIST YOURSELF NOW!!!!! where the
// reference's typed its car (the reference's laptop with its words wiped, the film's in Arial on
// its tracked page), and the car shots show a Founding Pass Sneaker standing where the car stood
// (the reference's backgrounds with the car taken out, moved by its own tracked camera). To the
// reference's own music. 1080 x 1920, 30 fps, 521 frames.

/**
 * The reference's own music, untouched (Yash's choice, 2026-10-26; unlicensed, so not for
 * Instagram: CREDITS.md). scripts/copy-rain-media.sh extracts it.
 */
export const RAIN_MUSIC_FILE_NAME = 'rain-music.wav'

export type RainFilmProps = {
  /** In public/audio/; null for a silent picture. */
  musicFileName: string | null
}

export const defaultRainProps: RainFilmProps = {
  musicFileName: RAIN_MUSIC_FILE_NAME,
}

/** A slow push-in on every car shot, from a little in so a tracked shift never shows an edge. */
const PUSH_IN_START_SCALE = 1.02
const PUSH_IN_END_SCALE = 1.05

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

/** The reference's 720 x 1280 frame, scaled to the film: everything inside is in its pixels. */
function ReferenceFrame({ matrix = [1, 0, 0, 1, 0, 0], children }: { matrix?: CssMatrix; children: ReactNode }) {
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

function FullPlate({ src }: { src: string }) {
  return (
    <Img src={src} style={{ position: 'absolute', left: 0, top: 0, width: REFERENCE_WIDTH, height: REFERENCE_HEIGHT }} />
  )
}

/** The laptop from the first replaced keystroke to the cut: its plate and the film's words. */
function TypingShot({ frame }: { frame: number }) {
  return (
    <ReferenceFrame>
      <FullPlate src={staticFile(`rain/plates/typing/${String(frame).padStart(4, '0')}.jpg`)} />
      <DocText frame={frame} />
    </ReferenceFrame>
  )
}

/** One car shot: its plate and its Sneaker, carried together by the reference's camera. */
function SneakerShot({ shotName, frame }: { shotName: RainCarShotName; frame: number }) {
  const { startFrame, endFrame } = carShots[shotName]
  const tracked = carShotTracks[shotName][frame - startFrame] ?? [1, 0, 0, 1, 0, 0]
  const scale = interpolate(frame, [startFrame, endFrame - 1], [PUSH_IN_START_SCALE, PUSH_IN_END_SCALE])
  const pushIn: CssMatrix = [scale, 0, 0, scale, (REFERENCE_WIDTH / 2) * (1 - scale), (REFERENCE_HEIGHT / 2) * (1 - scale)]
  return (
    <ReferenceFrame matrix={multiplyMatrices(pushIn, tracked)}>
      <FullPlate src={staticFile(`rain/plates/${shotName}.png`)} />
      <StandingSneaker sneaker={rainShots[shotName]} />
    </ReferenceFrame>
  )
}

export function RainFilm({ musicFileName }: RainFilmProps) {
  const frame = useCurrentFrame()
  const carShotName = readCarShotAtFrame(frame)
  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      <Sequence durationInFrames={TYPING_START_FRAME} name="Hook (the reference's footage)">
        <Video src={staticFile('rain/reference.mp4')} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </Sequence>
      {frame >= TYPING_START_FRAME && frame < TYPING_END_FRAME ? <TypingShot frame={frame} /> : null}
      {carShotName === null ? null : (
        <>
          <SneakerShot shotName={carShotName} frame={frame} />
          <AbsoluteFill style={{ opacity: 0.4 }}>
            <FilmGrain />
          </AbsoluteFill>
        </>
      )}
      {musicFileName === null ? null : <Audio src={staticFile(`audio/${musicFileName}`)} />}
    </AbsoluteFill>
  )
}
