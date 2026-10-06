import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig } from 'remotion'
import { readSceneDurationInFrames, toSceneBeatFrame } from '../beats'
import { CrossMarks } from '../components/CrossMarks'
import { Drift } from '../components/Drift'
import { MaskedRise } from '../components/MaskedRise'
import { contracts, rulesContent } from '../content'
import { filmLayouts } from '../layouts'
import { colors, easings, fontFamilies } from '../theme'
import type { SceneProps } from './scene-props'

const HAIRLINE_HEIGHT_PIXELS = 2
const ADDRESS_STAGGER_FRAMES = 15
const VERIFIED_DOT_SIZE_PIXELS = 14

/**
 * Scene 6 (0:31–0:38), black. One rule per beat, in mono, then the four verified contracts.
 * Only rules the contract itself enforces are here (the speed band is the API's: FACTS.md §2).
 */
export function RulesScene({ format }: SceneProps) {
  const { fps } = useVideoConfig()
  const durationInFrames = readSceneDurationInFrames('rules')
  const contractsStartFrame = toSceneBeatFrame('rules', 7)

  return (
    <AbsoluteFill style={{ backgroundColor: colors.darkBackground }}>
      <Drift durationInFrames={durationInFrames}>
        <Sequence name="Rules" durationInFrames={contractsStartFrame} premountFor={fps}>
          <RuleCards format={format} exitFrame={contractsStartFrame - 12} />
        </Sequence>
        <Sequence name="Contracts" from={contractsStartFrame} premountFor={fps}>
          <VerifiedContracts format={format} />
        </Sequence>
      </Drift>
    </AbsoluteFill>
  )
}

function RuleCards({ format, exitFrame }: SceneProps & { exitFrame: number }) {
  const frame = useCurrentFrame()
  const layout = filmLayouts[format]
  const { cards } = layout.rules
  const opacity = interpolate(frame, [exitFrame, exitFrame + 12], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easings.standard,
  })
  const blockHeight = cards.rowHeight * rulesContent.ruleCards.length

  return (
    <AbsoluteFill style={{ opacity }}>
      <MaskedRise
        lines={[rulesContent.metaItems.join('  •  ').toUpperCase()]}
        startFrame={0}
        fontSize={layout.metaFontSize}
        fontWeight={500}
        color={colors.textOnDarkSecondary}
        style={{ left: layout.rules.meta.left, top: layout.rules.meta.top }}
      />
      <CrossMarks
        box={{
          left: cards.origin.left,
          top: cards.origin.top,
          width: cards.width,
          height: blockHeight,
        }}
        color={colors.crossMark}
        contentStartFrame={0}
      />
      {rulesContent.ruleCards.map((rule, ruleIndex) => {
        const startFrame = toSceneBeatFrame('rules', ruleIndex)
        const rowTop = cards.origin.top + ruleIndex * cards.rowHeight
        return (
          <div key={rule}>
            {ruleIndex > 0 && frame >= startFrame - 3 && (
              <div
                style={{
                  position: 'absolute',
                  left: cards.origin.left,
                  top: rowTop,
                  width: cards.width,
                  height: HAIRLINE_HEIGHT_PIXELS,
                  backgroundColor: colors.overlayOnDark,
                }}
              />
            )}
            <MaskedRise
              lines={[rule]}
              startFrame={startFrame}
              fontSize={cards.fontSize}
              fontFamily={fontFamilies.mono}
              color={colors.textOnDark}
              style={{
                left: cards.origin.left,
                top: rowTop + (cards.rowHeight - cards.fontSize) / 2,
              }}
            />
          </div>
        )
      })}
    </AbsoluteFill>
  )
}

function VerifiedContracts({ format }: SceneProps) {
  const frame = useCurrentFrame()
  const layout = filmLayouts[format]
  const { addresses, verified, closing } = layout.rules
  const verifiedStartFrame = contracts.length * ADDRESS_STAGGER_FRAMES

  return (
    <AbsoluteFill>
      {contracts.map((contract, contractIndex) => {
        const startFrame = contractIndex * ADDRESS_STAGGER_FRAMES
        const rowTop = addresses.origin.top + contractIndex * addresses.rowHeight
        return (
          <div key={contract.address}>
            <MaskedRise
              lines={[contract.name]}
              startFrame={startFrame}
              fontSize={layout.metaFontSize}
              fontWeight={500}
              color={colors.textOnDarkSecondary}
              style={{ left: addresses.origin.left, top: rowTop }}
            />
            <MaskedRise
              lines={[contract.address]}
              startFrame={startFrame + 4}
              fontSize={addresses.fontSize}
              fontFamily={fontFamilies.mono}
              color={colors.textOnDark}
              style={{ left: addresses.origin.left, top: rowTop + layout.metaFontSize * 1.5 }}
            />
          </div>
        )
      })}
      {frame >= verifiedStartFrame && (
        <div
          style={{
            position: 'absolute',
            left: verified.left,
            top: verified.top + (layout.metaFontSize * 1.15 - VERIFIED_DOT_SIZE_PIXELS) / 2,
            width: VERIFIED_DOT_SIZE_PIXELS,
            height: VERIFIED_DOT_SIZE_PIXELS,
            borderRadius: VERIFIED_DOT_SIZE_PIXELS,
            backgroundColor: colors.highlight,
          }}
        />
      )}
      <MaskedRise
        lines={[rulesContent.verifiedMetaItems.join('  •  ').toUpperCase()]}
        startFrame={verifiedStartFrame}
        fontSize={layout.metaFontSize}
        fontWeight={500}
        color={colors.textOnDark}
        style={{ left: verified.left + VERIFIED_DOT_SIZE_PIXELS * 2, top: verified.top }}
      />
      <MaskedRise
        lines={rulesContent.closingLine}
        startFrame={toSceneBeatFrame('rules', 1)}
        fontSize={layout.rules.closingFontSize}
        lineHeight={1.1}
        color={colors.textOnDark}
        style={{ left: closing.left, top: closing.top }}
      />
    </AbsoluteFill>
  )
}
