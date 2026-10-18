import { APP_TOUR_FRAMES_PER_SECOND } from './beats'
import type { SneakerTabState } from './components/screens/SneakerTab'
import type { TransactionSheetState } from './components/screens/TransactionSheet'
import { repairedPanelContent, upgradeContent } from './content'
import { formatDurationForApp } from './format'
import { levelUpTimeline, repairTimeline } from './timeline'

// What the rebuilt screens show on each frame of the film: #3 after its repair, its upgrade, and
// the card at level 2. Every word is the app's own (content.ts, FACTS.md §15). No STRIDE balance
// appears anywhere in these beats (the repair left 9.3, which can't pay 50).

/** The Sneaker tab's scroll for the Upgrade panel: its button sits above the scroll view's edge. */
export const UPGRADE_PANEL_SCROLL_OFFSET = 900
/** The touch on UPGRADE TO LEVEL 2, in reel pixels at that scroll (like the reel's repair tap). */
export const UPGRADE_TOUCH = { x: 560, y: 1262 } as const
const PRESS_FRAMES = 10
/** The tab scrolls back to the card as the sheet slides down. */
const SCROLL_TO_CARD_DURATION_FRAMES = 36
/** The new level shows once the sheet is down: the speed line draws, efficiency rolls. */
export const LEVEL_TWO_SHOWN_FRAME = levelUpTimeline.sheetCloseFrame + 24

/**
 * The energy caption: 8 / 10 after the run, counting down live. The reel read 26:37 during the
 * repair (40.5 s); the film's clock runs on from 26:30 at the cut to the Upgrade panel.
 */
const NEXT_ENERGY_SECONDS_AT_UPGRADE_PANEL = 26 * 60 + 30

function readEnergyCaption(frame: number): string {
  const elapsedSeconds = (frame - repairTimeline.upgradePanelFrame) / APP_TOUR_FRAMES_PER_SECOND
  return `Next energy point in ${formatDurationForApp(NEXT_ENERGY_SECONDS_AT_UPGRADE_PANEL - elapsedSeconds)}`
}

export function buildUpgradeTabState({
  frame,
  levelOneMarkup,
  levelTwoMarkup,
  scrollOffset,
}: {
  frame: number
  levelOneMarkup: string
  levelTwoMarkup: string
  scrollOffset: number
}): SneakerTabState {
  const isLevelTwoShown = frame >= LEVEL_TWO_SHOWN_FRAME
  const isPressed =
    frame >= repairTimeline.upgradeTapFrame && frame < repairTimeline.upgradeTapFrame + PRESS_FRAMES
  return {
    artMarkup: isLevelTwoShown ? levelTwoMarkup : levelOneMarkup,
    ...(isLevelTwoShown ? { newSpeedLineStartFrame: LEVEL_TWO_SHOWN_FRAME } : {}),
    efficiencySteps: [
      { startFrame: 0, text: upgradeContent.efficiencyBefore },
      { startFrame: LEVEL_TWO_SHOWN_FRAME, text: upgradeContent.efficiencyAfter },
    ],
    energy: 8,
    maxEnergy: 10,
    energyCaption: readEnergyCaption(frame),
    repair: {
      title: repairedPanelContent.title,
      cost: repairedPanelContent.cost,
      description: repairedPanelContent.description,
      statChanges: [],
      actionLabel: repairedPanelContent.actionLabel,
      isActionDisabled: true,
      caption: repairedPanelContent.blockedMessage,
    },
    upgrade: {
      title: upgradeContent.panelTitle,
      cost: upgradeContent.cost,
      description: upgradeContent.panelDescription,
      statChanges: [
        {
          label: 'Level',
          valueBefore: upgradeContent.levelBefore,
          valueAfter: upgradeContent.levelAfter,
        },
        {
          label: 'Efficiency',
          valueBefore: upgradeContent.efficiencyBefore,
          valueAfter: upgradeContent.efficiencyAfter,
        },
      ],
      actionLabel: upgradeContent.actionLabel,
      isActionDisabled: false,
      isActionPressed: isPressed,
      // The app's "You have N STRIDE." line is left out: the film shows no balance here.
    },
    transferTitle: 'Send Sneaker #3',
    scrollOffset,
  }
}

/** The tab's scroll: at the Upgrade panel, then back up to the card as the sheet goes. */
export function readUpgradeTabScroll(frame: number, easing: (progress: number) => number): number {
  const startFrame = levelUpTimeline.sheetCloseFrame
  if (frame <= startFrame) return UPGRADE_PANEL_SCROLL_OFFSET
  const progress = Math.min(1, (frame - startFrame) / SCROLL_TO_CARD_DURATION_FRAMES)
  return UPGRADE_PANEL_SCROLL_OFFSET * (1 - easing(progress))
}

/** The upgrade's sheet: confirming, then on the drop, confirmed with its rows rolling. */
export function buildUpgradeSheetState(frame: number): TransactionSheetState {
  if (frame < levelUpTimeline.dropFrame) {
    return {
      phase: 'confirming',
      metaItems: upgradeContent.confirmingMeta,
      title: upgradeContent.confirmingTitle,
      caption: upgradeContent.confirmingCaption,
    }
  }
  return {
    phase: 'succeeded',
    metaItems: [upgradeContent.succeededMeta],
    title: upgradeContent.successTitle,
    caption: upgradeContent.spent,
    statChanges: [
      {
        label: 'Level',
        valueBefore: upgradeContent.levelBefore,
        valueAfter: upgradeContent.levelAfter,
        rollStartFrame: levelUpTimeline.dropFrame + 6,
      },
      {
        label: 'Efficiency',
        valueBefore: upgradeContent.efficiencyBefore,
        valueAfter: upgradeContent.efficiencyAfter,
        rollStartFrame: levelUpTimeline.dropFrame + 10,
      },
    ],
    viewTransactionLabel: upgradeContent.viewTransaction,
    doneLabel: upgradeContent.done,
  }
}

/** The repair's "Confirming on Monad…", rebuilt (the reel's own frames carry the app switch). */
export const repairConfirmingSheetState: TransactionSheetState = {
  phase: 'confirming',
  metaItems: upgradeContent.confirmingMeta,
  title: upgradeContent.confirmingTitle,
  caption: upgradeContent.confirmingCaption,
}
