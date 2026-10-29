import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { SvgArt } from '../../components/svg-markup'
import { FilmGrain } from '../../showroom/components/FilmGrain'
import { oneThingColors } from '../../theme'
import { revealCaptions } from '../content'
import { type RevealShotName, revealShots, SPARKLE_IN_FRAMES } from '../timeline'
import { GoldCaption } from './GoldCaption'

// The three reveal shots, in place of the reference's land: #0137 on a dark stage where its woman
// stood ("STRIDEMON"), a close-up as its aerial ("SNEAKER"), then the Founding Pass card for its
// price ("FREE 📍 MONAD TESTNET"). Each pushes in slowly, as the reference's own camera. The art is
// the frozen files as they are (DESIGNS_FROZEN_ON). In the film's 1080 px.

/** The laced art is 1000 × 600; its sole's middle is at (501, 520). */
const LACED_ART_WIDTH_UNITS = 1000
const LACED_ART_HEIGHT_UNITS = 600

/** How each shot frames its art: its centre and width at the start, and the push-in's end scale. */
const framings: Record<
  RevealShotName,
  {
    art: 'sneaker' | 'card'
    centerX: number
    centerY: number
    width: number
    endScale: number
    rotateDegrees: number
  }
> = {
  strideMon: {
    art: 'sneaker',
    centerX: 540,
    centerY: 1180,
    width: 1000,
    endScale: 1.05,
    rotateDegrees: 0,
  },
  sneaker: {
    art: 'sneaker',
    centerX: 600,
    centerY: 1060,
    width: 1900,
    endScale: 1.07,
    rotateDegrees: -6,
  },
  free: { art: 'card', centerX: 540, centerY: 1320, width: 820, endScale: 1.05, rotateDegrees: -3 },
}

const captionLayouts: Record<RevealShotName, { centerY: number; mainFontSize: number }> = {
  strideMon: { centerY: 640, mainFontSize: 230 },
  sneaker: { centerY: 1520, mainFontSize: 250 },
  free: { centerY: 470, mainFontSize: 250 },
}

/** The Sneaker floats a little, as if it were standing on air. */
const FLOAT_AMPLITUDE_PIXELS = 8
const FLOAT_PERIOD_FRAMES = 48

type RevealShotProps = {
  shotName: RevealShotName
  sneakerMarkup: string
  cardMarkup: string
}

export function RevealShot({ shotName, sneakerMarkup, cardMarkup }: RevealShotProps) {
  const frame = useCurrentFrame()
  const { startFrame, endFrame } = revealShots[shotName]
  const framing = framings[shotName]
  const scale = interpolate(frame, [startFrame, endFrame - 1], [1, framing.endScale])
  const floatOffset =
    Math.sin(((frame - startFrame) / FLOAT_PERIOD_FRAMES) * Math.PI * 2) * FLOAT_AMPLITUDE_PIXELS
  const artHeight =
    framing.art === 'sneaker'
      ? (framing.width * LACED_ART_HEIGHT_UNITS) / LACED_ART_WIDTH_UNITS
      : framing.width
  const caption = revealCaptions[shotName]
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 85% 55% at 50% 62%, ${oneThingColors.stageLight}, ${oneThingColors.stageDark})`,
      }}
    >
      <AbsoluteFill
        style={{
          scale: String(scale),
          transformOrigin: `${framing.centerX}px ${framing.centerY}px`,
        }}
      >
        {framing.art === 'sneaker' ? (
          <div
            style={{
              position: 'absolute',
              left: framing.centerX - framing.width * 0.42,
              width: framing.width * 0.84,
              top: framing.centerY + artHeight * 0.36,
              height: framing.width * 0.07,
              borderRadius: '50%',
              background: `radial-gradient(closest-side, ${oneThingColors.floorShadow}, transparent)`,
              scale: String(1 - floatOffset / 160),
            }}
          />
        ) : null}
        <div
          style={{
            position: 'absolute',
            left: framing.centerX - framing.width / 2,
            top: framing.centerY - artHeight / 2 + (framing.art === 'sneaker' ? floatOffset : 0),
            rotate: `${framing.rotateDegrees}deg`,
            ...(framing.art === 'card'
              ? {
                  borderRadius: 26,
                  overflow: 'hidden',
                  boxShadow: `0 40px 90px ${oneThingColors.cardShadow}, 0 0 60px ${oneThingColors.goldGlowFar}`,
                }
              : {}),
          }}
        >
          <SvgArt
            markup={framing.art === 'sneaker' ? sneakerMarkup : cardMarkup}
            width={framing.width}
          />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: 0.35 }}>
        <FilmGrain />
      </AbsoluteFill>
      <GoldCaption
        main={caption.main}
        pinned={caption.pinned}
        startFrame={startFrame}
        sparkleFrames={shotName === 'strideMon' ? SPARKLE_IN_FRAMES : null}
        centerY={captionLayouts[shotName].centerY}
        mainFontSize={captionLayouts[shotName].mainFontSize}
      />
    </AbsoluteFill>
  )
}
