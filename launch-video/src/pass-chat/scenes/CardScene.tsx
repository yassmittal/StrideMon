import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { MaskedRise } from '../../components/MaskedRise'
import { colors, easings, fontFamilies, fontWeights } from '../../theme'
import { burstShoes, readBurstShoePose } from '../burst'
import { PassShoe, SHOE_FRAME_UNITS, SHOE_PIVOT } from '../components/PassShoe'
import { SkyPhoto } from '../components/SkyPhoto'
import { SubFrameMotionBlur } from '../components/SubFrameMotionBlur'
import { heroLabel } from '../content'
import { cardLayout } from '../layout'
import { HERO_DESIGN_NUMBER } from '../sneakers'
import { burstTimeline, cardTimeline, PASS_CHAT_WIDTH, ringTimeline } from '../timeline'

// Scenes 4 and 5, and the start of 6, on the off-white page: the whip into the card with #0627
// floating in the same sky; the card growing as ten other passes' shoes burst out from behind
// #0627, past the card's edges, with only the sky behind them (Yash, STOP 1); then the card shrinking away into the
// middle, blurring out, before the flip to black. Measured from the reference (reference.md).

const FRAME_CENTRE_X = PASS_CHAT_WIDTH / 2
/** The card sits a little high, leaving room under it for the label; the grown card is centred. */
const CARD_CENTRE_Y = 492
const GROWN_CARD_CENTRE_Y = 540

/** The whip: the card arrives too big and blurred, and settles. */
const ARRIVAL_SCALE = 1.28
const ARRIVAL_BLUR_PIXELS = 30
/** While it holds, the card breathes in by 3% (linear: a drift). */
const BREATH_SCALE = 1.03
/** #0627's width as a share of the card's, and how far the burst's zoom brings it in. */
const HERO_WIDTH_RATIO = 0.5
const BURST_CONTENT_ZOOM = 1.32
/** The bob: ±1.5% of the card's height and a ±2° rock, on slow cycles. */
const BOB_RATIO = 0.015
const BOB_PERIOD_FRAMES = 150
const ROCK_DEGREES = 2
const ROCK_PERIOD_FRAMES = 190
/** The exit: the card shrinks into the middle as it blurs out. */
const EXIT_SCALE = 0.42
const EXIT_BLUR_PIXELS = 26
// Motion blur on the fast moves: the whip, the growth with the shoes' flight, and the exit.
const SHUTTER_FRACTION = 0.5
const BLUR_SAMPLE_COUNT = 10

export function CardScene() {
  const frame = useCurrentFrame()
  const isMoving =
    frame < cardTimeline.startFrame + cardTimeline.settleDurationFrames ||
    (frame >= burstTimeline.startFrame &&
      frame < burstTimeline.firstShoeFrame + 9 * burstTimeline.shoeStaggerFrames + 24) ||
    frame >= ringTimeline.startFrame
  const labelBottom = CARD_CENTRE_Y + cardLayout.height / 2 + cardLayout.labelGap
  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      <SubFrameMotionBlur
        frame={frame}
        shutterFraction={isMoving ? SHUTTER_FRACTION : 0}
        sampleCount={BLUR_SAMPLE_COUNT}
        render={(sampleFrame) => <CardPicture frame={sampleFrame} />}
      />
      <MaskedRise
        lines={[`${heroLabel.number}  ${heroLabel.name.toUpperCase()}`]}
        startFrame={cardTimeline.labelFrame}
        exitFrame={cardTimeline.labelExitFrame}
        fontSize={cardLayout.labelFontSize}
        fontFamily={fontFamilies.mono}
        fontWeight={fontWeights.regular}
        letterSpacing="0.08em"
        color={colors.textPrimary}
        style={{
          left: 0,
          right: 0,
          top: labelBottom,
          textAlign: 'center',
          whiteSpace: 'pre',
        }}
      />
    </AbsoluteFill>
  )
}

/** The card, the burst and #0627 on one (sub-)frame. */
function CardPicture({ frame }: { frame: number }) {
  const card = readCardState(frame)
  const heroWidth = card.smallWidth * HERO_WIDTH_RATIO * card.contentZoom
  const bobY = Math.sin((2 * Math.PI * frame) / BOB_PERIOD_FRAMES) * BOB_RATIO * card.height
  const rockDegrees = Math.sin((2 * Math.PI * frame) / ROCK_PERIOD_FRAMES) * ROCK_DEGREES
  const heroCentreY = card.centreY - card.height * 0.04 + bobY
  return (
    <AbsoluteFill
      style={{
        scale: card.wholeScale,
        filter: card.blurPixels > 0.1 ? `blur(${card.blurPixels}px)` : undefined,
        transformOrigin: `${FRAME_CENTRE_X}px ${card.centreY}px`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: FRAME_CENTRE_X - card.width / 2,
          top: card.centreY - card.height / 2,
          width: card.width,
          height: card.height,
          borderRadius: cardLayout.radius,
          overflow: 'hidden',
          // Keeps the rounded clip on the composited sky.
          isolation: 'isolate',
        }}
      >
        <SkyPhoto
          width={card.width}
          height={card.height}
          overscan={1.18 * card.contentZoom}
          offsetX={-(frame - cardTimeline.startFrame) * 0.25}
        />
      </div>
      {burstShoes.map((shoe) => {
        if (frame < shoe.launchFrame) return null
        const pose = readBurstShoePose(shoe, frame)
        const width = shoe.width * card.contentZoom
        return (
          <PlacedShoe
            key={shoe.designNumber}
            designNumber={shoe.designNumber}
            width={width}
            centreX={FRAME_CENTRE_X + pose.x}
            centreY={heroCentreY + pose.y}
            scale={pose.scale}
            rotateDegrees={pose.rotateDegrees}
          />
        )
      })}
      <PlacedShoe
        designNumber={HERO_DESIGN_NUMBER}
        width={heroWidth}
        centreX={FRAME_CENTRE_X}
        centreY={heroCentreY}
        scale={1}
        rotateDegrees={rockDegrees}
      />
    </AbsoluteFill>
  )
}

/** A shoe whose pivot (the middle of a mid-height shoe) sits on a point. */
function PlacedShoe({
  designNumber,
  width,
  centreX,
  centreY,
  scale,
  rotateDegrees,
}: {
  designNumber: number
  width: number
  centreX: number
  centreY: number
  scale: number
  rotateDegrees: number
}) {
  const height = (width * SHOE_FRAME_UNITS.height) / SHOE_FRAME_UNITS.width
  return (
    <div
      style={{
        position: 'absolute',
        left: centreX - width / 2,
        top: centreY - height * 0.6,
        width,
        height,
        scale,
        rotate: `${rotateDegrees}deg`,
        transformOrigin: `${SHOE_PIVOT.x} ${SHOE_PIVOT.y}`,
      }}
    >
      <PassShoe designNumber={designNumber} width={width} instanceId={String(designNumber)} />
    </div>
  )
}

type CardState = {
  smallWidth: number
  width: number
  height: number
  centreY: number
  /** The burst's zoom on the shoes. */
  contentZoom: number
  /** The whip's settle, the breath and the exit, on the whole picture. */
  wholeScale: number
  blurPixels: number
}

function readCardState(frame: number): CardState {
  const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
  const settle = interpolate(
    frame,
    [cardTimeline.startFrame, cardTimeline.startFrame + cardTimeline.settleDurationFrames],
    [0, 1],
    { ...clamp, easing: easings.outExpo },
  )
  const breath = interpolate(
    frame,
    [cardTimeline.startFrame, burstTimeline.startFrame],
    [1, BREATH_SCALE],
    clamp,
  )
  const growProgress = interpolate(
    frame,
    [burstTimeline.startFrame, burstTimeline.startFrame + burstTimeline.growDurationFrames],
    [0, 1],
    { ...clamp, easing: easings.outExpo },
  )
  const exit = interpolate(
    frame,
    [ringTimeline.startFrame, ringTimeline.startFrame + ringTimeline.cardExitDurationFrames],
    [0, 1],
    // Accelerating into the flip, as measured; the theme's curves all slow down at their end.
    { ...clamp, easing: (progress) => progress ** 2 },
  )
  // The breath hands over to the growth, so the card never jumps.
  const smallWidth = cardLayout.width * breath
  const smallHeight = cardLayout.height * breath
  return {
    smallWidth: cardLayout.width,
    width: smallWidth + (cardLayout.grownWidth - smallWidth) * growProgress,
    height: smallHeight + (cardLayout.grownHeight - smallHeight) * growProgress,
    centreY: CARD_CENTRE_Y + (GROWN_CARD_CENTRE_Y - CARD_CENTRE_Y) * growProgress,
    contentZoom: breath * (1 + (BURST_CONTENT_ZOOM - 1) * growProgress),
    wholeScale: (ARRIVAL_SCALE + (1 - ARRIVAL_SCALE) * settle) * (1 + (EXIT_SCALE - 1) * exit),
    blurPixels: ARRIVAL_BLUR_PIXELS * (1 - settle) + EXIT_BLUR_PIXELS * exit,
  }
}
