import { colors } from '../theme'

// Every word in the App tour film, and nothing else (docs/app-tour-video-prompt.md §2). FACTS.md §15
// gives each one its source; change a line there first. The words inside the phone are the app's
// own (footage, or the rebuilt screens, which copy apps/mobile's strings).

export type AppTourSectionName = 'meet' | 'walk' | 'earn' | 'repair' | 'levelUp' | 'end'

export type AppTourSection = {
  headline: string
  background: string
  headlineColor: string
}

/** The palette (§2): each step of the loop has its own field and headline colour. */
export const appTourSections: Record<AppTourSectionName, AppTourSection> = {
  meet: {
    headline: 'Meet StrideMon.',
    background: colors.highlight,
    headlineColor: colors.textPrimary,
  },
  walk: {
    headline: 'Walk or run.',
    background: colors.darkBackground,
    headlineColor: colors.highlight,
  },
  earn: {
    headline: 'Earn STRIDE.',
    background: colors.background,
    headlineColor: colors.textPrimary,
  },
  repair: {
    headline: 'Keep it running.',
    background: colors.primary,
    headlineColor: colors.background,
  },
  levelUp: { headline: 'Level up.', background: colors.accent, headlineColor: colors.textOnDark },
  end: { headline: '', background: colors.highlight, headlineColor: colors.textPrimary },
}

export const endCardContent = {
  wordmark: 'StrideMon',
  tagline: 'Walk. Earn. Upgrade.',
  question: 'Ready to move?',
  url: 'stridemon.xyz',
  pills: ['Android demo', 'Monad testnet'],
} as const

/** The rebuilt upgrade (UpgradePanel.tsx, SneakerTransactionSheet.tsx), for #3 going 1 → 2. */
export const upgradeContent = {
  panelTitle: 'Upgrade',
  /** formatStrideAmount(50 STRIDE): cost = 50 × level (FACTS.md §2). */
  cost: '50 STRIDE',
  panelDescription: 'Higher efficiency earns more STRIDE for every rewarded minute.',
  actionLabel: 'Upgrade to level 2',
  levelBefore: '1',
  levelAfter: '2',
  efficiencyBefore: '10',
  efficiencyAfter: '12',
  confirmingTitle: 'Confirming on Monad…',
  confirmingCaption: 'Usually a couple of seconds.',
  succeededMeta: 'Confirmed on Monad',
  confirmingMeta: ['Step 2 of 2', 'Confirming'],
  successTitle: 'Level 2 reached',
  spent: 'Spent 50 STRIDE',
  viewTransaction: 'View transaction',
  done: 'Done',
} as const

/** The rebuilt Repair panel after the repair: what RepairPanel.tsx shows at full durability. */
export const repairedPanelContent = {
  title: 'Repair',
  /** The repair quote at durability 100 (FACTS.md §2's formula: 0 × …). */
  cost: '0 STRIDE',
  description:
    'Every run wears your Sneaker down. At zero durability it can’t run until it’s repaired.',
  actionLabel: 'Repair',
  blockedMessage: 'Already at full durability.',
} as const
