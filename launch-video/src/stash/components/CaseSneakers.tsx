import { AbsoluteFill, Img, staticFile } from 'remotion'
import { stashColors } from '../../theme'
import { STASH_SNEAKER_WIDTH, stashSneakers } from '../content'
import { REFERENCE_HEIGHT, REFERENCE_TO_FILM_SCALE, REFERENCE_WIDTH } from '../timeline'
import { caseTrack } from '../tracks'

// The six Sneakers lying in the case, carried by the case's own tracked move (src/stash/tracks.ts):
// one homography per frame takes shot A's keyframe pixels, where they're placed, onto the frame.
// Flat, as the laced art is drawn (never redrawn or recoloured), with a soft shadow on the case
// floor, and dimmed or lifted with the frame's own light so they fade up with the case.

/** The layer is laid out this many times larger and scaled back down, so the art stays sharp in the close shot. */
const SUPERSAMPLE = 3
/** The laced art's 1000 x 600 view, and the middle of the drawn Sneaker within it. */
const ART_ASPECT = 600 / 1000
const ART_MIDDLE_X = 501
const ART_MIDDLE_Y = 315
/** The reference is a phone's soft, muted picture: the art is brought down to sit in it. */
const ART_GRADE = 'saturate(0.86) contrast(0.94)'

export function readSneakerArtPath(designNumber: number): string {
  return staticFile(`stash/sneaker-${String(designNumber).padStart(4, '0')}.svg`)
}

/** A row-by-row 3 x 3 homography as CSS matrix3d (column by column, z left alone). */
function toMatrix3d(matrix: readonly number[]): string {
  const [h0, h1, h2, h3, h4, h5, h6, h7, h8] = matrix
  return `matrix3d(${[h0, h3, 0, h6, h1, h4, 0, h7, 0, 0, 1, 0, h2, h5, 0, h8].join(', ')})`
}

export function CaseSneakers({ trackFrame }: { trackFrame: number }) {
  const track = caseTrack[trackFrame]
  if (track === undefined) return null
  const width = STASH_SNEAKER_WIDTH * SUPERSAMPLE
  const height = width * ART_ASPECT
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: REFERENCE_WIDTH * SUPERSAMPLE,
          height: REFERENCE_HEIGHT * SUPERSAMPLE,
          transformOrigin: '0 0',
          transform: `scale(${REFERENCE_TO_FILM_SCALE}) ${toMatrix3d(track.matrix)} scale(${1 / SUPERSAMPLE})`,
          filter: `brightness(${track.light}) ${ART_GRADE}`,
        }}
      >
        {stashSneakers.map((sneaker) => (
          <Img
            key={sneaker.designNumber}
            src={readSneakerArtPath(sneaker.designNumber)}
            style={{
              position: 'absolute',
              left: sneaker.x * SUPERSAMPLE - (ART_MIDDLE_X / 1000) * width,
              top: sneaker.y * SUPERSAMPLE - (ART_MIDDLE_Y / 600) * height,
              width,
              height,
              filter: `drop-shadow(0 ${3 * SUPERSAMPLE}px ${5 * SUPERSAMPLE}px ${stashColors.sneakerShadow})`,
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  )
}
