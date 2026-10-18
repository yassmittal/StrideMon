import { Freeze, interpolate, useCurrentFrame } from 'remotion'
import { SneakerArt } from '../../../components/SneakerArt'
import { easings } from '../../../theme'
import { ReelFootage } from '../ReelFootage'
import { appColors, appRadii } from './app-styles'

// Home as the reel shows it at 10.5 s (a new player's starter Sneaker #3), with the two things
// that move drawn over it: the Sneaker card's art drawing itself (the renderer's own picture, its
// level ticks and durability bar filling with the lime), and the energy bar filling. Everything
// else is the reel's own frame. Placed by measuring that frame (scripts/check-app-tour-rebuilds.py,
// "homeDrawIn").

/** The art square on the card: the card's full width, from its top edge (reel 10.5 s). */
const ART_BOX = { left: 26.5, top: 132, size: 667 } as const
/** Home's energy track (4 pt), full at 10 / 10. */
const ENERGY_TRACK = { left: 63.5, top: 1074.5, width: 593, height: 7.5 } as const
/** The dark panel's own colour behind the track while it's covered. */
const ENERGY_COVER = { left: 60, top: 1070, width: 600, height: 16 } as const
/** One white line every frame, so the draw-in fits its beats (SneakerArt's default is 3). */
export const HOME_LINE_STAGGER_FRAMES = 1
const ENERGY_FILL_DURATION_FRAMES = 30

type HomeDrawInProps = {
  artMarkup: string
  homeClipFrame: number
  /** The art starts drawing here, in this component's frames. */
  drawInStartFrame: number
  /** The energy bar fills from here. */
  energyFillStartFrame: number
}

export function HomeDrawIn({
  artMarkup,
  homeClipFrame,
  drawInStartFrame,
  energyFillStartFrame,
}: HomeDrawInProps) {
  const frame = useCurrentFrame()
  const energyShare = interpolate(
    frame,
    [energyFillStartFrame, energyFillStartFrame + ENERGY_FILL_DURATION_FRAMES],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easings.emphasized },
  )
  return (
    <>
      <Freeze frame={homeClipFrame}>
        <ReelFootage clipName="home" />
      </Freeze>
      <div
        style={{
          position: 'absolute',
          left: ART_BOX.left,
          top: ART_BOX.top,
          width: ART_BOX.size,
          height: ART_BOX.size,
          overflow: 'hidden',
          borderTopLeftRadius: appRadii.medium,
          borderTopRightRadius: appRadii.medium,
          backgroundColor: appColors.darkPanel,
        }}
      >
        <SneakerArt
          markup={artMarkup}
          size={ART_BOX.size}
          drawInStartFrame={drawInStartFrame}
          lineStaggerFrames={HOME_LINE_STAGGER_FRAMES}
        />
      </div>
      <div
        style={{ position: 'absolute', ...ENERGY_COVER, backgroundColor: appColors.darkPanel }}
      />
      <div
        style={{
          position: 'absolute',
          ...ENERGY_TRACK,
          borderRadius: appRadii.tiny,
          backgroundColor: appColors.darkTrack,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${energyShare * 100}%`,
            height: '100%',
            borderRadius: appRadii.tiny,
            backgroundColor: appColors.highlight,
          }}
        />
      </div>
    </>
  )
}
