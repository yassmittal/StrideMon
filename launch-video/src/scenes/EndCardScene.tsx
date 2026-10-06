import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { readSceneDurationInFrames, toSceneBeatFrame } from '../beats'
import { ArrowIcon } from '../components/ArrowIcon'
import { ClipRise } from '../components/ClipRise'
import { Drift } from '../components/Drift'
import { MaskedRise } from '../components/MaskedRise'
import { SneakerArt, toSneakerArtFileName, useSneakerArtMarkups } from '../components/SneakerArt'
import { endCardContent } from '../content'
import { filmLayouts } from '../layouts'
import {
  colors,
  easings,
  floatingPillShadow,
  fontFamilies,
  fontWeights,
  letterSpacings,
  radii,
} from '../theme'
import type { SceneProps } from './scene-props'

const PANEL_ART_FILE_NAMES = [toSneakerArtFileName({ level: 2, durability: 100 })]
const HEADLINE_LINE_HEIGHT = 0.95
const PILL_HEIGHT_PIXELS = 96
const PILL_FONT_SIZE_PIXELS = 34
const WORDMARK_FONT_SIZE_PIXELS = 72

/**
 * Scene 7 (0:38–0:45), off-white. "Walk. Earn. Upgrade." line by line on three beats, then the
 * Sneaker panel, the wordmark and the URL. It holds long enough for the last frame to be the poster.
 */
export function EndCardScene({ format }: SceneProps) {
  const frame = useCurrentFrame()
  const layout = filmLayouts[format]
  const { endCard } = layout
  const markups = useSneakerArtMarkups(PANEL_ART_FILE_NAMES)
  const markup = markups?.get(PANEL_ART_FILE_NAMES[0] ?? '')
  const durationInFrames = readSceneDurationInFrames('endCard')
  const brandStartFrame = toSceneBeatFrame('endCard', 4)
  const disclaimerStartFrame = toSceneBeatFrame('endCard', 5)
  const lineHeightPixels = endCard.headlineFontSize * HEADLINE_LINE_HEIGHT

  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      <Drift durationInFrames={durationInFrames}>
        {endCardContent.headlineLines.map((line, lineIndex) => (
          <MaskedRise
            key={line}
            lines={[line]}
            startFrame={toSceneBeatFrame('endCard', lineIndex)}
            fontSize={endCard.headlineFontSize}
            lineHeight={HEADLINE_LINE_HEIGHT}
            letterSpacing={letterSpacings.display}
            color={colors.textPrimary}
            isOpticallyPulledLeft
            style={{
              left: endCard.headline.left,
              top: endCard.headline.top + lineIndex * lineHeightPixels,
            }}
          />
        ))}
        {markup !== undefined && (
          <ClipRise
            startFrame={brandStartFrame}
            style={{
              left: endCard.panel.left,
              top: endCard.panel.top,
              width: endCard.panel.width,
              height: endCard.panel.height,
              borderRadius: radii.medium * 2,
            }}
          >
            <SneakerArt markup={markup} size={endCard.panel.width} />
          </ClipRise>
        )}
        <MaskedRise
          lines={[endCardContent.wordmark]}
          startFrame={brandStartFrame}
          fontSize={WORDMARK_FONT_SIZE_PIXELS}
          color={colors.textPrimary}
          letterSpacing={letterSpacings.displayLarge}
          style={{ left: endCard.brand.left, top: endCard.brand.top }}
        />
        <MaskedRise
          lines={[endCardContent.metaItems.join('  •  ').toUpperCase()]}
          startFrame={brandStartFrame + 4}
          fontSize={layout.metaFontSize}
          fontWeight={500}
          color={colors.textPrimary}
          style={{
            left: endCard.brand.left,
            top: endCard.brand.top + WORDMARK_FONT_SIZE_PIXELS * 1.15,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: endCard.pill.left,
            top: endCard.pill.top,
            width: endCard.pillWidth,
            height: PILL_HEIGHT_PIXELS,
            borderRadius: radii.pill,
            backgroundColor: colors.surface,
            boxShadow: floatingPillShadow,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `0 ${PILL_HEIGHT_PIXELS * 0.4}px 0 ${PILL_HEIGHT_PIXELS * 0.45}px`,
            fontFamily: fontFamilies.satoshi,
            fontWeight: fontWeights.medium,
            fontSize: PILL_FONT_SIZE_PIXELS,
            color: colors.textPrimary,
            opacity: interpolate(frame, [brandStartFrame + 8, brandStartFrame + 26], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: easings.standard,
            }),
            translate: interpolate(
              frame,
              [brandStartFrame + 8, brandStartFrame + 32],
              ['0px 24px', '0px 0px'],
              {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: easings.outExpo,
              },
            ),
          }}
        >
          {endCardContent.siteLabel}
          <ArrowIcon size={PILL_FONT_SIZE_PIXELS * 1.1} color={colors.textPrimary} />
        </div>
        <MaskedRise
          lines={[endCardContent.disclaimer]}
          startFrame={disclaimerStartFrame}
          fontSize={layout.metaFontSize}
          color={colors.textSecondarySmall}
          style={{ left: endCard.disclaimer.left, top: endCard.disclaimer.top }}
        />
      </Drift>
    </AbsoluteFill>
  )
}
