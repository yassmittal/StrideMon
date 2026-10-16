import type { CSSProperties, ReactNode } from 'react'
import { passChatColors } from '../../theme'

// A generic Android phone in CSS 3D, so the chat on its screen stays real, crisp text. Flat: one
// lime body, its sides one flat step darker, an ink bezel and a punch-hole, side buttons a second
// step darker. No gradients, highlights, reflections or shadow (docs/pass-chat-video-prompt.md §3).
//
// The body is an extrusion of its rounded outline: a front face, a back face and a wall of flat
// facets round the outline (the straight sides, and CORNER_FACET_COUNT facets per corner). Stacked
// slices would turn into separate lines when seen exactly edge-on; a facet wall stays one solid
// lime slab at 90°.
//
// No shared 3D context: each face and facet carries the whole transform itself and hides its back.
// The body is convex, so culling the parts that face away is all the visibility it needs, and
// Chrome never has to depth-sort the planes (its sorting dropped the faces whenever most of the
// phone was far off-frame, as in the chat's close-up).

const CORNER_FACET_COUNT = 10
/** Each facet overlaps the next a little, so no seam opens between them. */
const FACET_OVERLAP_PIXELS = 1.5

export type PhoneDimensions = {
  width: number
  height: number
  cornerRadius: number
  depth: number
}

type PhoneBodyProps = {
  dimensions: PhoneDimensions
  /** The front face's content (the bezel and screen), drawn on the lime body. */
  front: ReactNode
  /** The back face's content, drawn on the lime body as seen from behind. */
  back: ReactNode
  /** The body's transform in the scene, about its own centre (the parent sets the perspective). */
  transform: string
}

/** The phone, centred on its own origin and facing +z (the viewer) before `transform`. */
export function PhoneBody({ dimensions, front, back, transform }: PhoneBodyProps) {
  const { width, height, cornerRadius, depth } = dimensions
  const partStyle: CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    backfaceVisibility: 'hidden',
    transformOrigin: '0px 0px',
  }
  const faceStyle: CSSProperties = {
    ...partStyle,
    width,
    height,
    borderRadius: cornerRadius,
    backgroundColor: passChatColors.phoneBody,
  }
  // Every part is laid out at the origin, then centred on it, so `transform` turns it about the
  // phone's centre.
  const placeFace = (local: string) =>
    `${transform} ${local} translate3d(${-width / 2}px, ${-height / 2}px, 0px)`
  return (
    <>
      {readWallFacets(dimensions).map((facet) => (
        <div
          key={facet.key}
          style={{
            ...partStyle,
            width: depth,
            height: facet.length,
            backgroundColor: passChatColors.phoneSide,
            transform: `${transform} ${facet.transform} translate3d(${-depth / 2}px, ${-facet.length / 2}px, 0px)`,
          }}
        />
      ))}
      <SideButtons dimensions={dimensions} transform={transform} partStyle={partStyle} />
      <div style={{ ...faceStyle, transform: placeFace(`translateZ(${depth / 2}px)`) }}>
        {front}
      </div>
      <div
        style={{
          ...faceStyle,
          transform: placeFace(`translateZ(${-depth / 2}px) rotateY(180deg)`),
        }}
      >
        {back}
      </div>
    </>
  )
}

type WallFacet = { key: string; length: number; transform: string }

/**
 * The wall round the outline: each facet is a strip `depth` wide (along z) and `length` long
 * (along the outline), turned so its face points out from the body at angle θ (0 = +x, the right
 * side; 90° = +y, the bottom, since y points down).
 */
function readWallFacets({ width, height, cornerRadius }: PhoneDimensions): WallFacet[] {
  const facets: WallFacet[] = []
  const halfWidth = width / 2
  const halfHeight = height / 2
  const toFacet = (
    key: string,
    centreX: number,
    centreY: number,
    angleDegrees: number,
    length: number,
  ): WallFacet => ({
    key,
    length: length + FACET_OVERLAP_PIXELS,
    transform: `translate3d(${centreX}px, ${centreY}px, 0px) rotateZ(${angleDegrees}deg) rotateY(90deg)`,
  })
  // Straight sides: right, bottom, left, top.
  facets.push(toFacet('right', halfWidth, 0, 0, height - 2 * cornerRadius))
  facets.push(toFacet('bottom', 0, halfHeight, 90, width - 2 * cornerRadius))
  facets.push(toFacet('left', -halfWidth, 0, 180, height - 2 * cornerRadius))
  facets.push(toFacet('top', 0, -halfHeight, 270, width - 2 * cornerRadius))
  // Corners: each arc split into flat facets, each at its chord's midpoint.
  const innerX = halfWidth - cornerRadius
  const innerY = halfHeight - cornerRadius
  const corners = [
    { key: 'bottom-right', centreX: innerX, centreY: innerY, fromDegrees: 0 },
    { key: 'bottom-left', centreX: -innerX, centreY: innerY, fromDegrees: 90 },
    { key: 'top-left', centreX: -innerX, centreY: -innerY, fromDegrees: 180 },
    { key: 'top-right', centreX: innerX, centreY: -innerY, fromDegrees: 270 },
  ]
  const stepDegrees = 90 / CORNER_FACET_COUNT
  const chordLength = 2 * cornerRadius * Math.sin(((stepDegrees / 2) * Math.PI) / 180)
  const chordDistance = cornerRadius * Math.cos(((stepDegrees / 2) * Math.PI) / 180)
  for (const corner of corners) {
    for (let index = 0; index < CORNER_FACET_COUNT; index += 1) {
      const angleDegrees = corner.fromDegrees + (index + 0.5) * stepDegrees
      const angle = (angleDegrees * Math.PI) / 180
      facets.push(
        toFacet(
          `${corner.key}-${index}`,
          corner.centreX + chordDistance * Math.cos(angle),
          corner.centreY + chordDistance * Math.sin(angle),
          angleDegrees,
          chordLength,
        ),
      )
    }
  }
  return facets
}

/** The power key and volume rocker on the right side, a step darker, standing just proud of it. */
function SideButtons({
  dimensions,
  transform,
  partStyle,
}: {
  dimensions: PhoneDimensions
  transform: string
  partStyle: CSSProperties
}) {
  const { width, height, depth } = dimensions
  const buttonWidth = depth * 0.44
  const buttons = [
    { key: 'power', centreY: -height * 0.12, length: height * 0.06 },
    { key: 'volume', centreY: -height * 0.24, length: height * 0.11 },
  ]
  return buttons.map((button) => (
    <div
      key={button.key}
      style={{
        ...partStyle,
        width: buttonWidth,
        height: button.length,
        borderRadius: buttonWidth / 2,
        backgroundColor: passChatColors.phoneDetail,
        transform: `${transform} translate3d(${width / 2 + 3}px, ${button.centreY}px, 0px) rotateY(90deg) translate3d(${-buttonWidth / 2}px, ${-button.length / 2}px, 0px)`,
      }}
    />
  ))
}
