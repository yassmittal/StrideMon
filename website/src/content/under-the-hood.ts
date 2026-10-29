import { sectionIds } from './site'

// The landing page's one section for the curious (D-050): the rules, fair play and privacy, and
// the contracts, as tabs. Each tab keeps its old section's id, so `/#on-chain` and the others
// still land on it. Why Monad is its own section now (D-073).

export const underTheHoodContent = {
  id: sectionIds.underTheHood,
  heading: 'How it holds together',
  intro: 'The rules, the checks on every run, and the contracts.',
  tabListLabel: 'Under the hood',
} as const

export type UnderTheHoodTabId =
  | typeof sectionIds.rules
  | typeof sectionIds.fairPlay
  | typeof sectionIds.onChain

export const underTheHoodTabs: readonly { id: UnderTheHoodTabId; label: string }[] = [
  { id: sectionIds.rules, label: 'The rules' },
  { id: sectionIds.fairPlay, label: 'Fair play' },
  { id: sectionIds.onChain, label: 'Contracts' },
]
