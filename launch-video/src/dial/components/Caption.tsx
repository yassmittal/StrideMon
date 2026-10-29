import { interpolate, useCurrentFrame } from 'remotion'
import { dialColors, fontFamilies, fontWeights } from '../../theme'
import { dialSneakers, formatDesignNumber } from '../content'
import { type DialShotName, REFERENCE_WIDTH } from '../timeline'

// The reference's caption over each shot: the key's digit in a thin circle, then the name in
// quotes ("Cake “Honey Cake”" there, "#0049 “Gold Skate Night”" here). Both fade up on the cut,
// the name a frame behind the digit. In the plate's pixels.

const DIGIT_CENTER_Y = 216
const DIGIT_DIAMETER = 30
const NAME_CENTER_Y = 284
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

export function Caption({ shotName, startFrame }: { shotName: DialShotName; startFrame: number }) {
  const frame = useCurrentFrame()
  const { key, designNumber, name } = dialSneakers[shotName]
  const digitShown = interpolate(frame, [startFrame, startFrame + 3], [0, 1], clamp)
  const nameShown = interpolate(frame, [startFrame + 1, startFrame + 5], [0, 1], clamp)
  const textShadow = `0 1px 10px ${dialColors.captionShadow}`
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: REFERENCE_WIDTH / 2 - DIGIT_DIAMETER / 2,
          top: DIGIT_CENTER_Y - DIGIT_DIAMETER / 2,
          width: DIGIT_DIAMETER,
          height: DIGIT_DIAMETER,
          borderRadius: '50%',
          border: `1.2px solid ${dialColors.caption}`,
          boxShadow: `0 0 8px ${dialColors.captionShadow}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: fontFamilies.satoshi,
          fontWeight: fontWeights.regular,
          fontSize: 17,
          color: dialColors.caption,
          textShadow,
          opacity: digitShown,
        }}
      >
        {key}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: REFERENCE_WIDTH,
          top: NAME_CENTER_Y - 20,
          lineHeight: '40px',
          textAlign: 'center',
          fontFamily: fontFamilies.dialSerif,
          fontWeight: fontWeights.regular,
          fontSize: 31,
          color: dialColors.caption,
          textShadow,
          opacity: nameShown,
          translate: `0 ${(1 - nameShown) * 6}px`,
          filter: nameShown < 1 ? `blur(${(1 - nameShown) * 3}px)` : undefined,
        }}
      >
        {formatDesignNumber(designNumber)} “{name}”
      </div>
    </>
  )
}
