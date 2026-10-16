import type { ReactNode } from 'react'
import { passChatColors, radii } from '../../theme'
import { PHONE_BEZEL_PIXELS, PHONE_RIM_PIXELS, phoneDimensions } from '../layout'

// The phone's two faces, drawn on its lime body (PhoneBody). Flat fills only.

/** The front: a lime rim, the ink bezel, and the screen inside it. */
export function PhoneFront({ screen }: { screen: ReactNode }) {
  const bezelRadius = phoneDimensions.cornerRadius - PHONE_RIM_PIXELS
  return (
    <div
      style={{
        position: 'absolute',
        inset: PHONE_RIM_PIXELS,
        borderRadius: bezelRadius,
        backgroundColor: passChatColors.phoneInk,
        padding: PHONE_BEZEL_PIXELS,
      }}
    >
      {screen}
    </div>
  )
}

// The StrideMon mark: the line Sneaker from website/src/app/icon.svg, its three strokes on the
// icon's own 64-unit grid, drawn in ink without the icon's dark tile.
const MARK_VIEW_BOX = '10 14 46 32'
const MARK_STROKES = [
  {
    pathData: 'M13 43h30c5 0 9-1 10-3 1-1 0-2-1-2L26 37c-5 0-9-1-12-1-1 3-1 6-1 7Z',
    width: 3,
  },
  {
    pathData: 'M14 36c-2-5-2-10-1-15 4 2 8 3 11 3l3-6 15 10c7 2 10 6 11 10',
    width: 3,
  },
  { pathData: 'M15 32c8 1 16-2 22-6', width: 3.5 },
] as const

/** The back: a flat camera block with two lenses, and the StrideMon mark in ink in the middle. */
export function PhoneBack() {
  const { width } = phoneDimensions
  const blockSize = width * 0.3
  const lensSize = blockSize * 0.34
  const markWidth = width * 0.46
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: width * 0.08,
          top: width * 0.08,
          width: blockSize,
          height: blockSize * 1.08,
          borderRadius: blockSize * 0.26,
          backgroundColor: passChatColors.phoneSide,
          border: `${width * 0.006}px solid ${passChatColors.phoneDetail}`,
        }}
      >
        {[0.2, 0.56].map((topRatio) => (
          <div
            key={topRatio}
            style={{
              position: 'absolute',
              left: (blockSize - lensSize) / 2 - width * 0.006,
              top: blockSize * topRatio - width * 0.006,
              width: lensSize,
              height: lensSize,
              borderRadius: radii.pill,
              backgroundColor: passChatColors.phoneInk,
              border: `${lensSize * 0.1}px solid ${passChatColors.phoneDetail}`,
            }}
          />
        ))}
      </div>
      <svg
        viewBox={MARK_VIEW_BOX}
        width={markWidth}
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: (width - markWidth) / 2,
          top: phoneDimensions.height * 0.44,
          overflow: 'visible',
        }}
      >
        {MARK_STROKES.map((stroke) => (
          <path
            key={stroke.pathData}
            d={stroke.pathData}
            fill="none"
            stroke={passChatColors.phoneInk}
            strokeWidth={stroke.width}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
    </>
  )
}
