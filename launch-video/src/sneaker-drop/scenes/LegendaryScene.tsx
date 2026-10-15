import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { SvgArt } from '../../components/svg-markup'
import { colors } from '../../theme'
import { RegisteredSneaker } from '../components/RegisteredSneaker'
import {
  useLacedSneakerMarkup,
  useLegendaryFounderSneakerMarkup,
} from '../components/sneaker-art-context'
import { legendaryLabel } from '../content'
import { type SneakerDropFormat, sneakerDropLayouts } from '../layout'
import { readDriftScale } from '../motion'
import { LEGENDARY_DESIGN_NUMBER } from '../sneakers'
import { legendaryTimeline } from '../timeline'
import { DesignLabel } from './DesignLabel'

/**
 * Scene 6 (beats 40–43), on black. The join's kick cuts out of the flood to #0020 Earthshine,
 * alone and huge; its number, name and rarity rise on the next clap and stay; and the last clap
 * cuts to its Founder Sneaker picture, as SneakerArtRenderer draws it, so it reads as a token.
 */
export function LegendaryScene({ format }: { format: SneakerDropFormat }) {
  const frame = useCurrentFrame()
  const layout = sneakerDropLayouts[format]
  const sneakerMarkup = useLacedSneakerMarkup(LEGENDARY_DESIGN_NUMBER)
  const pictureMarkup = useLegendaryFounderSneakerMarkup()
  const isPicture = frame >= legendaryTimeline.founderSneakerFrame
  const shotStartFrame = isPicture
    ? legendaryTimeline.founderSneakerFrame
    : legendaryTimeline.startFrame

  return (
    <AbsoluteFill style={{ backgroundColor: colors.darkBackground }}>
      <AbsoluteFill style={{ scale: readDriftScale(frame - shotStartFrame) }}>
        {isPicture ? (
          <div
            style={{
              position: 'absolute',
              left: layout.founderSneaker.left,
              top: layout.founderSneaker.top,
            }}
          >
            <SvgArt markup={pictureMarkup} width={layout.founderSneaker.width} />
          </div>
        ) : (
          <RegisteredSneaker
            markup={sneakerMarkup}
            placement={layout.legendary}
            hasRim
            instanceId="legendary"
          />
        )}
      </AbsoluteFill>
      {/* The label stays over the picture's cut (it sits below it), so it's up 1.9 s. */}
      <DesignLabel
        format={format}
        number={legendaryLabel.number}
        name={legendaryLabel.name}
        rarity={legendaryLabel.rarity}
        startFrame={legendaryTimeline.labelFrame}
        color={colors.textOnDark}
      />
    </AbsoluteFill>
  )
}
