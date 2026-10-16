import type { CSSProperties } from 'react'
import { Img, staticFile } from 'remotion'

// The sky photo (CREDITS.md), copied to public/pass-chat/sky.jpg by scripts/copy-pass-chat-art.sh:
// the phone shot's background and the inside of the card, the same sky in both. It's the film's
// only photo and its only gradient.

export const SKY_PHOTO_PATH = staticFile('pass-chat/sky.jpg')
/** The photo's own aspect ratio (5568 × 3712). */
const SKY_ASPECT_RATIO = 3 / 2

type SkyPhotoProps = {
  /** The box the sky fills, in its parent's pixels. */
  width: number
  height: number
  /** Extra size beyond covering the box, so a pan or a roll never shows an edge. */
  overscan: number
  /** The pan, in the box's pixels, and the roll, in degrees. */
  offsetX?: number
  offsetY?: number
  rotateDegrees?: number
  style?: CSSProperties
}

/** The sky covering a box, centred, panned and rolled. */
export function SkyPhoto({
  width,
  height,
  overscan,
  offsetX = 0,
  offsetY = 0,
  rotateDegrees = 0,
  style,
}: SkyPhotoProps) {
  const coverWidth = Math.max(width, height * SKY_ASPECT_RATIO) * overscan
  const coverHeight = coverWidth / SKY_ASPECT_RATIO
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', ...style }}>
      <Img
        src={SKY_PHOTO_PATH}
        style={{
          position: 'absolute',
          left: (width - coverWidth) / 2,
          top: (height - coverHeight) / 2,
          width: coverWidth,
          height: coverHeight,
          translate: `${offsetX}px ${offsetY}px`,
          rotate: `${rotateDegrees}deg`,
        }}
      />
    </div>
  )
}
