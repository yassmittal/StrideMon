import { sectionIds } from './site'

// The landing page's one section for the curious (D-050): the rules, fair play and privacy, the
// contracts, and why Monad, as tabs. Each tab keeps its old section's id, so `/#on-chain` and the
// others still land on it.

export const underTheHoodContent = {
  id: sectionIds.underTheHood,
  metaLabels: ['Under the hood', 'Monad testnet'],
  heading: 'How it holds together',
  intro: 'The rules, the checks on every run, and the contracts, for anyone who wants to look.',
  tabListLabel: 'Under the hood',
} as const

export type UnderTheHoodTabId =
  | typeof sectionIds.rules
  | typeof sectionIds.fairPlay
  | typeof sectionIds.onChain
  | typeof sectionIds.whyMonad

export const underTheHoodTabs: readonly { id: UnderTheHoodTabId; label: string }[] = [
  { id: sectionIds.rules, label: 'The rules' },
  { id: sectionIds.fairPlay, label: 'Fair play' },
  { id: sectionIds.onChain, label: 'Contracts' },
  { id: sectionIds.whyMonad, label: 'Why Monad' },
]
