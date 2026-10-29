import { Img, staticFile } from 'remotion'
import type { RainSneaker } from '../content'

// A Sneaker standing where the reference's car stood, in the plate's pixels: the laced art as
// minted (never recoloured, DESIGNS_FROZEN_ON), only dimmed to the shot's light, on a soft contact
// shadow and the long, faint shadow a low sun or a street light throws.

/** The art's viewBox is 1000 x 600; the sole's middle is at (501, 520). */
const ART_WIDTH = 1000
const ART_HEIGHT = 600
const SOLE_MIDDLE_X = 501
const SOLE_MIDDLE_Y = 520

export function readSneakerPath(designNumber: number): string {
  return staticFile(`rain/sneakers/${String(designNumber).padStart(4, '0')}.svg`)
}

export function StandingSneaker({ sneaker }: { sneaker: RainSneaker }) {
  const { placement, brightness } = sneaker
  const pixelsPerUnit = placement.width / ART_WIDTH
  const height = ART_HEIGHT * pixelsPerUnit
  const left = placement.x - SOLE_MIDDLE_X * pixelsPerUnit
  const top = placement.y - SOLE_MIDDLE_Y * pixelsPerUnit
  const shadowWidth = placement.width * 0.9
  const shadowHeight = placement.width * 0.075
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: placement.x - shadowWidth / 2,
          top: placement.y - shadowHeight * 0.5,
          width: shadowWidth,
          height: shadowHeight,
          borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(8, 7, 6, 0.7), rgba(8, 7, 6, 0))',
          filter: `blur(${placement.width * 0.01}px)`,
        }}
      />
      <Img
        src={readSneakerPath(sneaker.designNumber)}
        style={{
          position: 'absolute',
          left,
          top,
          width: placement.width,
          height,
          // The phone's softness and the shot's light; a faint shadow off the ground behind it.
          filter: `blur(${(placement.width * 0.0009).toFixed(2)}px) brightness(${brightness}) drop-shadow(0 ${placement.width * 0.012}px ${placement.width * 0.02}px rgba(0, 0, 0, 0.35))`,
        }}
      />
    </>
  )
}
