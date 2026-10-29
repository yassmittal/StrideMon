import { Audio } from '@remotion/media'
import type { ReactNode } from 'react'
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame } from 'remotion'
import { FilmGrain } from '../showroom/components/FilmGrain'
import { Caption } from './components/Caption'
import { EndCard } from './components/EndCard'
import { Keypad } from './components/Keypad'
import { readSneakerCenter, ShotLens } from './components/ShotPicture'
import { dialSneakers } from './content'
import {
  type DialShotName,
  dialShots,
  endCardTimeline,
  FIRST_CAPTION_DELAY_FRAMES,
  keypadTimeline,
  REFERENCE_HEIGHT,
  REFERENCE_TO_FILM_SCALE,
  REFERENCE_WIDTH,
  readShotAtFrame,
} from './timeline'

// The Dial film (docs/dial-video-prompt.md): the reference's "Dial a slice" ad with Founding Pass
// Sneakers in place of its cakes. A phone keypad fills with a Sneaker per digit, the call button is
// pressed, the keypad zooms into key 1, and each key's shot follows on the reference's own cuts: the
// reference's café with its cake taken out (a clean plate, scripts/build-dial-plates.py) and the
// Sneaker standing in its place, captioned with its number and name. Then the lockup and the
// waitlist line. To the reference's own music, looped under the longer end card. 1080 × 1920,
// 30 fps, 420 frames.

/**
 * The reference's own music with one 4-beat loop added before its last hit, so it carries the end
 * card (Yash's ask, 2026-10-26; unlicensed, so not for Instagram: CREDITS.md).
 * scripts/copy-dial-media.sh makes it.
 */
export const DIAL_MUSIC_FILE_NAME = 'dial-music.wav'

export type DialFilmProps = {
  /** In public/audio/; null for a silent picture. */
  musicFileName: string | null
}

export const defaultDialProps: DialFilmProps = {
  musicFileName: DIAL_MUSIC_FILE_NAME,
}

/** A slow push-in about the shoe on every shot, from the zoom's own end scale. */
const PUSH_IN_END_SCALE = 1.045

/** The reference's 720 × 1280 frame, scaled to the film: everything inside is in its pixels. */
function ReferenceFrame({ children }: { children: ReactNode }) {
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
          transform: `scale(${REFERENCE_TO_FILM_SCALE})`,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  )
}

function Shot({ shotName }: { shotName: DialShotName }) {
  const frame = useCurrentFrame()
  const { startFrame, endFrame } = dialShots[shotName]
  const scale = interpolate(frame, [startFrame, endFrame - 1], [1, PUSH_IN_END_SCALE])
  const sneakerCenter = readSneakerCenter(dialSneakers[shotName].placement)
  const captionStartFrame =
    shotName === 'honey' ? startFrame + FIRST_CAPTION_DELAY_FRAMES : startFrame
  return (
    <AbsoluteFill>
      <ReferenceFrame>
        <ShotLens
          shotName={shotName}
          centerX={sneakerCenter.x}
          centerY={sneakerCenter.y}
          scale={scale}
        />
      </ReferenceFrame>
      <AbsoluteFill style={{ opacity: 0.4 }}>
        <FilmGrain />
      </AbsoluteFill>
      <ReferenceFrame>
        <Caption shotName={shotName} startFrame={captionStartFrame} />
      </ReferenceFrame>
    </AbsoluteFill>
  )
}

export function DialFilm({ musicFileName }: DialFilmProps) {
  const frame = useCurrentFrame()
  const shotName = readShotAtFrame(frame)
  let picture: ReactNode = null
  if (frame < keypadTimeline.circleOpenEndFrame) {
    picture = (
      <ReferenceFrame>
        <Keypad />
      </ReferenceFrame>
    )
  } else if (shotName !== null) {
    picture = <Shot shotName={shotName} />
  } else if (frame >= endCardTimeline.startFrame) {
    picture = <EndCard />
  }
  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      {picture}
      {musicFileName === null ? null : <Audio src={staticFile(`audio/${musicFileName}`)} />}
    </AbsoluteFill>
  )
}
