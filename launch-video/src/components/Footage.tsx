import { Video } from '@remotion/media'
import { Freeze, staticFile, useVideoConfig } from 'remotion'
import type { FootageCrop } from '../layouts'

// Every footage file is a 586 × 1280, 60 fps intermediate in public/footage/ (scripts/cut-footage.sh).
export const FOOTAGE_WIDTH_PIXELS = 586
export const FOOTAGE_HEIGHT_PIXELS = 1280

type FootageProps = {
  fileName: string
  /** Show only this frame of the file (for speed ramps that map film frames to source time). */
  sourceFrame?: number
  /** Skip this many frames of the file before playing. */
  trimBeforeFrames?: number
}

/** A footage file filling its parent (the phone's screen), anchored to the top like the app. */
export function Footage({ fileName, sourceFrame, trimBeforeFrames = 0 }: FootageProps) {
  const { fps } = useVideoConfig()
  const video = (
    <Video
      src={staticFile(`footage/${fileName}`)}
      muted
      trimBefore={trimBeforeFrames}
      premountFor={fps}
      objectFit="cover"
      style={{ width: '100%', height: '100%', objectPosition: 'center top' }}
    />
  )
  if (sourceFrame === undefined) return video
  return <Freeze frame={sourceFrame}>{video}</Freeze>
}

type CroppedFootageProps = FootageProps & { crop: FootageCrop }

/** A band of a footage file, scaled up and placed in the frame (a punch-in). */
export function CroppedFootage({ crop, ...footageProps }: CroppedFootageProps) {
  const sourceLeft = crop.sourceLeft ?? 0
  const sourceWidth = crop.sourceWidth ?? FOOTAGE_WIDTH_PIXELS
  return (
    <div
      style={{
        position: 'absolute',
        left: crop.frame.left,
        top: crop.frame.top,
        width: sourceWidth * crop.scale,
        height: crop.sourceHeight * crop.scale,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: -sourceLeft * crop.scale,
          top: -crop.sourceTop * crop.scale,
          width: FOOTAGE_WIDTH_PIXELS * crop.scale,
          height: FOOTAGE_HEIGHT_PIXELS * crop.scale,
        }}
      >
        <Footage {...footageProps} />
      </div>
    </div>
  )
}
