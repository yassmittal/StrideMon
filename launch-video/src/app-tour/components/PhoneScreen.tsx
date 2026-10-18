import { Freeze, interpolate, useCurrentFrame } from 'remotion'
import { toSneakerArtFileName } from '../../components/SneakerArt'
import { easings } from '../../theme'
import {
  appTourShots,
  findAppTourShot,
  REEL_HEIGHT_PIXELS,
  REEL_WIDTH_PIXELS,
  reelMoments,
} from '../footage'
import {
  buildUpgradeSheetState,
  buildUpgradeTabState,
  readUpgradeTabScroll,
  repairConfirmingSheetState,
  UPGRADE_TOUCH,
} from '../screen-states'
import {
  earnTimeline,
  levelUpTimeline,
  meetTimeline,
  repairTimeline,
  walkTimeline,
} from '../timeline'
import { ReelFootage } from './ReelFootage'
import { HomeDrawIn } from './screens/HomeDrawIn'
import { SneakerTab } from './screens/SneakerTab'
import { SplashScreen } from './screens/SplashScreen'
import { TransactionSheet } from './screens/TransactionSheet'
import { TapRing } from './TapRing'

// What the phone's screen shows on the current frame, at the reel's size (720 × 1560): the shot
// list in footage.ts, the taps on the reel's own touch points, and the one slide (the splash up to
// "Minting your Sneaker…").

/** The Sneaker pictures the film shows, from the renderer (public/sneaker/). */
export const appTourArtFileNames = {
  levelOne: toSneakerArtFileName({ level: 1, durability: 100, tokenId: 3 }),
  levelTwo: toSneakerArtFileName({ level: 2, durability: 100, tokenId: 3 }),
} as const

/** Where the reel's finger touched (its "show taps" dot), in reel pixels. */
export const appTourTaps = [
  { frame: meetTimeline.tapFrame, x: 515, y: 1223, tone: 'onLight' },
  { frame: walkTimeline.stopTapFrame, x: 470, y: 1299, tone: 'onDark' },
  // The SNEAKER tab, on the cut to it: a tab tap.
  { frame: earnTimeline.sneakerTabFrame, x: 268, y: 1470, tone: 'onLight', kind: 'tab' },
  { frame: earnTimeline.repairTapFrame, x: 562, y: 1083, tone: 'onLight' },
  { frame: repairTimeline.confirmTapFrame, x: 538, y: 1340, tone: 'onLight' },
  { frame: repairTimeline.upgradeTapFrame, ...UPGRADE_TOUCH, tone: 'onLight' },
] as const

const SPLASH_SLIDE_DURATION_FRAMES = 18
/** The repair's confirming backdrop: the Sneaker tab where the reel had it (35.9–42.6 s). */
const REPAIR_BACKDROP_SCROLL_OFFSET = 620

export function PhoneScreen({ artMarkups }: { artMarkups: ReadonlyMap<string, string> }) {
  const frame = useCurrentFrame()
  const levelOneMarkup = artMarkups.get(appTourArtFileNames.levelOne) ?? ''
  const levelTwoMarkup = artMarkups.get(appTourArtFileNames.levelTwo) ?? ''
  return (
    <div
      style={{
        position: 'absolute',
        width: REEL_WIDTH_PIXELS,
        height: REEL_HEIGHT_PIXELS,
        overflow: 'hidden',
      }}
    >
      <ShotAt frame={frame} levelOneMarkup={levelOneMarkup} levelTwoMarkup={levelTwoMarkup} />
      {appTourTaps.map((tap) => (
        <TapRing
          key={tap.frame}
          x={tap.x}
          y={tap.y}
          frame={tap.frame}
          tone={tap.tone}
          kind={'kind' in tap ? tap.kind : 'button'}
        />
      ))}
    </div>
  )
}

function ShotAt({
  frame,
  levelOneMarkup,
  levelTwoMarkup,
}: {
  frame: number
  levelOneMarkup: string
  levelTwoMarkup: string
}) {
  // The splash slides up to "Minting your Sneaker…" (Expo Router's push on Android).
  const slide = interpolate(
    frame,
    [meetTimeline.mintingFrame, meetTimeline.mintingFrame + SPLASH_SLIDE_DURATION_FRAMES],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easings.standard },
  )
  if (frame >= meetTimeline.mintingFrame && slide < 1) {
    return (
      <>
        <div style={{ position: 'absolute', inset: 0, translate: `0px ${-slide * 30}%` }}>
          <SplashScreen />
        </div>
        <div style={{ position: 'absolute', inset: 0, translate: `0px ${(1 - slide) * 100}%` }}>
          <Freeze frame={0}>
            <ReelFootage clipName="minting" />
          </Freeze>
        </div>
      </>
    )
  }

  const shot = findAppTourShot(frame) ?? appTourShots[0]
  if (shot === undefined) return null
  switch (shot.kind) {
    case 'splash':
      return <SplashScreen />
    case 'footage':
      return (
        <Freeze frame={Math.round(shot.readClipFrame(frame))}>
          <ReelFootage clipName={shot.clipName} />
        </Freeze>
      )
    case 'homeDrawIn':
      return (
        <HomeDrawIn
          artMarkup={levelOneMarkup}
          homeClipFrame={reelMoments.homeStill}
          drawInStartFrame={meetTimeline.homeFrame + 4}
          energyFillStartFrame={meetTimeline.homeFrame + 44}
        />
      )
    case 'repairConfirming':
      return (
        <>
          <SneakerTab
            state={buildUpgradeTabState({
              frame,
              levelOneMarkup,
              levelTwoMarkup,
              scrollOffset: REPAIR_BACKDROP_SCROLL_OFFSET,
            })}
          />
          <TransactionSheet state={repairConfirmingSheetState} />
        </>
      )
    case 'sneakerTabUpgrade':
    case 'upgradeSheet':
      return (
        <>
          <SneakerTab
            state={buildUpgradeTabState({
              frame,
              levelOneMarkup,
              levelTwoMarkup,
              scrollOffset: readUpgradeTabScroll(frame, easings.standard),
            })}
          />
          {shot.kind === 'upgradeSheet' && (
            <TransactionSheet
              state={buildUpgradeSheetState(frame)}
              openFrame={levelUpTimeline.confirmingFrame}
              closeFrame={levelUpTimeline.sheetCloseFrame}
            />
          )}
        </>
      )
    default: {
      const unhandledShot: never = shot
      throw new Error(`Unhandled shot: ${JSON.stringify(unhandledShot)}`)
    }
  }
}
