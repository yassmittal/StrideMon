import { AbsoluteFill } from 'remotion'
import { toSneakerArtFileName, useSneakerArtMarkups } from '../../components/SneakerArt'
import { colors } from '../../theme'
import { HomeDrawIn } from '../components/screens/HomeDrawIn'
import { SneakerTab, type SneakerTabState } from '../components/screens/SneakerTab'
import { TransactionSheet } from '../components/screens/TransactionSheet'
import { reelMoments } from '../footage'

// Each rebuilt screen in the reel's own state, at the reel's size (720 × 1560), for the overlay
// check against a reel frame (scripts/check-app-tour-rebuilds.py). The film shows the same
// components with its own states. Every word here is on the reel's frame (FACTS.md §15).

export type RebuildCheckName =
  | 'repairConfirming'
  | 'repairSucceeded'
  | 'sneakerTabTop'
  | 'sneakerTabScrolled'
  | 'upgradePanel'
  | 'homeDrawIn'

export const rebuildCheckNames: readonly RebuildCheckName[] = [
  'homeDrawIn',
  'repairConfirming',
  'repairSucceeded',
  'sneakerTabTop',
  'sneakerTabScrolled',
  'upgradePanel',
]

/** #3 after the run, before the repair (the reel's 34.9–36.4 s). */
const ART_FILE_NAME = toSneakerArtFileName({ level: 1, durability: 99, tokenId: 3 })
/** #3 new, on Home (the reel's 10.5 s). */
const NEW_ART_FILE_NAME = toSneakerArtFileName({ level: 1, durability: 100, tokenId: 3 })

const REPAIR_DESCRIPTION =
  'Every run wears your Sneaker down. At zero durability it can’t run until it’s repaired.'
const UPGRADE_DESCRIPTION = 'Higher efficiency earns more STRIDE for every rewarded minute.'

/** The scroll offsets that put the rebuild where the reel's frame is scrolled. */
export const REEL_SCROLL_OFFSETS = { top: 0, scrolled: 624, upgradePanel: 1381 } as const

function buildReelTabState(
  artMarkup: string,
  {
    scrollOffset,
    balance,
    energyCaption,
  }: { scrollOffset: number; balance: string; energyCaption: string },
): SneakerTabState {
  return {
    artMarkup,
    efficiencySteps: [{ startFrame: 0, text: '10' }],
    energy: 8,
    maxEnergy: 10,
    energyCaption,
    repair: {
      title: 'Repair',
      cost: '0.7 STRIDE',
      description: REPAIR_DESCRIPTION,
      statChanges: [{ label: 'Durability', valueBefore: '99', valueAfter: '100' }],
      actionLabel: 'Repair to 100',
      isActionDisabled: false,
      caption: `You have ${balance} STRIDE.`,
    },
    upgrade: {
      title: 'Upgrade',
      cost: '50 STRIDE',
      description: UPGRADE_DESCRIPTION,
      statChanges: [
        { label: 'Level', valueBefore: '1', valueAfter: '2' },
        { label: 'Efficiency', valueBefore: '10', valueAfter: '12' },
      ],
      actionLabel: 'Upgrade to level 2',
      isActionDisabled: true,
      caption: `Not enough rewards. You need 50 STRIDE and have ${balance} STRIDE. Walk to earn more.`,
    },
    transferTitle: 'Send Sneaker #3',
    scrollOffset,
  }
}

export function RebuildCheck({ checkName }: { checkName: RebuildCheckName }) {
  const markups = useSneakerArtMarkups([ART_FILE_NAME, NEW_ART_FILE_NAME])
  const artMarkup = markups?.get(ART_FILE_NAME)
  const newArtMarkup = markups?.get(NEW_ART_FILE_NAME)
  return (
    // Text as the film draws it (AppTourFilm: no hinting).
    <AbsoluteFill style={{ backgroundColor: colors.surface, textRendering: 'geometricPrecision' }}>
      {newArtMarkup !== undefined && checkName === 'homeDrawIn' && (
        // Fully drawn: the overlay must vanish into the reel's own frame.
        <HomeDrawIn
          artMarkup={newArtMarkup}
          homeClipFrame={reelMoments.homeStill}
          drawInStartFrame={-1000}
          energyFillStartFrame={-1000}
        />
      )}
      {checkName === 'repairConfirming' && (
        <TransactionSheet
          state={{
            phase: 'confirming',
            metaItems: ['Step 2 of 2', 'Confirming'],
            title: 'Confirming on Monad…',
            caption: 'Usually a couple of seconds.',
          }}
          // The reel's arc at 40.50 s runs from about 11 to 3 o'clock.
          spinnerPhaseDegrees={-120}
        />
      )}
      {checkName === 'repairSucceeded' && (
        <TransactionSheet
          state={{
            phase: 'succeeded',
            metaItems: ['Confirmed on Monad'],
            title: 'Sneaker repaired',
            caption: 'Spent 0.7 STRIDE',
            statChanges: [{ label: 'Durability', valueBefore: '99', valueAfter: '100' }],
            viewTransactionLabel: 'View transaction',
            doneLabel: 'Done',
          }}
        />
      )}
      {artMarkup !== undefined && checkName === 'sneakerTabTop' && (
        <SneakerTab
          state={buildReelTabState(artMarkup, {
            scrollOffset: REEL_SCROLL_OFFSETS.top,
            balance: '10',
            energyCaption: 'Next energy point in 27:02',
          })}
        />
      )}
      {artMarkup !== undefined && checkName === 'sneakerTabScrolled' && (
        <SneakerTab
          state={buildReelTabState(artMarkup, {
            scrollOffset: REEL_SCROLL_OFFSETS.scrolled,
            balance: '10',
            energyCaption: 'Next energy point in 27:00',
          })}
        />
      )}
      {artMarkup !== undefined && checkName === 'upgradePanel' && (
        // The reel's 49.0 s is Sneaker #1 on another wallet with 15 STRIDE: only its Upgrade panel
        // is compared, for the layout.
        <SneakerTab
          state={buildReelTabState(artMarkup, {
            scrollOffset: REEL_SCROLL_OFFSETS.upgradePanel,
            balance: '15',
            energyCaption: 'Next energy point in 27:00',
          })}
        />
      )}
    </AbsoluteFill>
  )
}
