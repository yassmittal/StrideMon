import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { ClipRise } from '../../components/ClipRise'
import { Drift } from '../../components/Drift'
import { MaskedRise } from '../../components/MaskedRise'
import { SvgArt, useSvgMarkups } from '../../components/svg-markup'
import { colors, fontFamilies, letterSpacings } from '../../theme'
import { readWaitlistSceneDurationInFrames, toWaitlistSceneBeatFrame } from '../beats'
import { collectionContent } from '../content'
import { waitlistLayout } from '../layout'
import {
  GRID_COLUMN_COUNT,
  GRID_DESIGN_NUMBERS,
  HERO_DESIGN_NUMBER,
  LEGENDARY_DESIGN_NUMBER,
  toPassCardPath,
} from '../pass-art'

const CARD_PATHS = [
  ...new Set([...GRID_DESIGN_NUMBERS, HERO_DESIGN_NUMBER, LEGENDARY_DESIGN_NUMBER]),
].map(toPassCardPath)
const CARD_RADIUS_PIXELS = 6

/** The collection's grid, in beats from its first frame. */
export const collectionSceneBeats = {
  /** Each row of cards starts rising half a beat after the one above, the first on the flip. */
  firstRowStart: 0,
  rowInterval: 0.5,
  headline: 1,
  punchIn: 4,
  legendaryFlip: 6,
} as const

/** When each grid row starts rising, in scene frames: on the flip, then every off-beat. */
function readGridRowStartFrames(): number[] {
  const rowCount = Math.ceil(GRID_DESIGN_NUMBERS.length / GRID_COLUMN_COUNT)
  return Array.from({ length: rowCount }, (_, rowIndex) =>
    toWaitlistSceneBeatFrame(
      'collection',
      collectionSceneBeats.firstRowStart + rowIndex * collectionSceneBeats.rowInterval,
    ),
  )
}

// The rise is out-expo, so a row reads as landed about 4 frames in, well before it settles.
const ROW_SEEN_LANDED_FRAMES = 4

/** When each grid row is seen to land, in scene frames, for its tick. */
export function readGridRowLandingFrames(): number[] {
  return readGridRowStartFrames().map((startFrame) => startFrame + ROW_SEEN_LANDED_FRAMES)
}

/**
 * Scene 2 (0:03–0:07). A hard flip to off-white, and the collection lands row by row on the
 * off-beats. One cut punches in to #0137 alone. A flip to black for the Legendary #0020, its
 * rarity in lime. "Each design exists once." stays through all three, flipping colour with them.
 */
export function CollectionScene() {
  const frame = useCurrentFrame()
  const { collection, metaFontSize } = waitlistLayout
  const markups = useSvgMarkups(CARD_PATHS)
  const punchInFrame = toWaitlistSceneBeatFrame('collection', collectionSceneBeats.punchIn)
  const legendaryFrame = toWaitlistSceneBeatFrame('collection', collectionSceneBeats.legendaryFlip)
  const isLegendary = frame >= legendaryFrame
  const textColor = isLegendary ? colors.textOnDark : colors.textPrimary
  const readMarkup = (designNumber: number) => markups?.get(toPassCardPath(designNumber))

  return (
    <AbsoluteFill
      style={{ backgroundColor: isLegendary ? colors.darkBackground : colors.background }}
    >
      <Drift durationInFrames={readWaitlistSceneDurationInFrames('collection')}>
        {frame < punchInFrame && <Grid readMarkup={readMarkup} />}
        {frame >= punchInFrame && (
          <OneCard
            markup={readMarkup(isLegendary ? LEGENDARY_DESIGN_NUMBER : HERO_DESIGN_NUMBER)}
          />
        )}
        {isLegendary && (
          <div
            style={{
              position: 'absolute',
              left: collection.callout.left,
              top: collection.callout.top,
              display: 'flex',
              alignItems: 'baseline',
              gap: collection.calloutFontSize * 0.6,
              whiteSpace: 'pre',
            }}
          >
            <MaskedRise
              lines={[collectionContent.legendaryLabel.toUpperCase()]}
              startFrame={legendaryFrame}
              fontSize={collection.calloutFontSize}
              fontFamily={fontFamilies.mono}
              color={colors.highlight}
              style={{ position: 'relative' }}
            />
            <MaskedRise
              lines={[collectionContent.legendaryCountText.toUpperCase()]}
              startFrame={legendaryFrame + 4}
              fontSize={metaFontSize}
              fontFamily={fontFamilies.mono}
              color={colors.textOnDarkSecondary}
              style={{ position: 'relative' }}
            />
          </div>
        )}
        <MaskedRise
          lines={[collectionContent.headline]}
          startFrame={toWaitlistSceneBeatFrame('collection', collectionSceneBeats.headline)}
          fontSize={collection.headlineFontSize}
          letterSpacing={letterSpacings.display}
          color={textColor}
          isOpticallyPulledLeft
          style={{ left: collection.headline.left, top: collection.headline.top }}
        />
      </Drift>
    </AbsoluteFill>
  )
}

function Grid({ readMarkup }: { readMarkup: (designNumber: number) => string | undefined }) {
  const { grid, gridGap } = waitlistLayout.collection
  const cardSize = (grid.width - gridGap * (GRID_COLUMN_COUNT - 1)) / GRID_COLUMN_COUNT
  const rowStartFrames = readGridRowStartFrames()

  return (
    <>
      {GRID_DESIGN_NUMBERS.map((designNumber, cardIndex) => {
        const rowIndex = Math.floor(cardIndex / GRID_COLUMN_COUNT)
        const columnIndex = cardIndex % GRID_COLUMN_COUNT
        const markup = readMarkup(designNumber)
        const rowStartFrame = rowStartFrames[rowIndex] ?? 0
        if (markup === undefined) return null
        return (
          <ClipRise
            key={designNumber}
            // Columns follow each other by a frame, so a row reads as one move with a little grain.
            startFrame={rowStartFrame + columnIndex}
            style={{
              left: grid.left + columnIndex * (cardSize + gridGap),
              top: grid.top + rowIndex * (cardSize + gridGap),
              width: cardSize,
              height: cardSize,
              borderRadius: CARD_RADIUS_PIXELS,
            }}
          >
            <SvgArt markup={markup} width={cardSize} />
          </ClipRise>
        )
      })}
    </>
  )
}

function OneCard({ markup }: { markup: string | undefined }) {
  const { card } = waitlistLayout.collection
  if (markup === undefined) return null
  return (
    <div
      style={{
        position: 'absolute',
        left: card.left,
        top: card.top,
        width: card.width,
        height: card.height,
        borderRadius: CARD_RADIUS_PIXELS * 2,
        overflow: 'hidden',
      }}
    >
      <SvgArt markup={markup} width={card.width} />
    </div>
  )
}
