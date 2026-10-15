import { MaskedRise } from '../../components/MaskedRise'
import { colors, fontFamilies, fontWeights } from '../../theme'
import { type SneakerDropFormat, sneakerDropLayouts } from '../layout'

const LINE_GAP_RATIO = 1.5
const WORD_STAGGER_FRAMES = 4

/**
 * A design's number and name in small mono (`#0137  ROSE HIKER NIGHT`), and its rarity in lime
 * under it (only ever on black). Each line rises from behind its clip, the film's one type move.
 */
export function DesignLabel({
  format,
  number,
  name,
  rarity,
  startFrame,
  color,
}: {
  format: SneakerDropFormat
  number: string
  name: string
  rarity?: string
  startFrame: number
  color: string
}) {
  const { label, metaFontSize } = sneakerDropLayouts[format]
  const lines = [`${number}  ${name}`.toUpperCase(), ...(rarity === undefined ? [] : [rarity])]
  return (
    <>
      {lines.map((line, lineIndex) => (
        <MaskedRise
          key={line}
          lines={[line.toUpperCase()]}
          startFrame={startFrame + lineIndex * 3 * WORD_STAGGER_FRAMES}
          fontSize={metaFontSize}
          fontFamily={fontFamilies.mono}
          fontWeight={fontWeights.medium}
          color={lineIndex === 0 ? color : colors.highlight}
          style={{ left: label.left, top: label.top + lineIndex * metaFontSize * LINE_GAP_RATIO }}
        />
      ))}
    </>
  )
}
