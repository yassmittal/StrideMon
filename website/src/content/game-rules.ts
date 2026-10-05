// SneakerGame's launch config, from docs/architecture/game-rules.md. Copied, not imported
// (D-035), so a rule change must update this file too.
export type GameRule = {
  label: string
  value: number
  fractionDigits: number
  unit: string
  explanation: string
}

export const gameRules: readonly GameRule[] = [
  {
    label: 'Max energy',
    value: 10,
    fractionDigits: 0,
    unit: 'points',
    explanation: 'One point is one rewarded minute.',
  },
  {
    label: 'Energy regeneration',
    value: 30,
    fractionDigits: 0,
    unit: 'minutes',
    explanation: 'One point comes back every 30 minutes.',
  },
  {
    label: 'Reward',
    value: 0.5,
    fractionDigits: 1,
    unit: 'SOLE',
    explanation:
      'Per efficiency point per minute. A starter at efficiency 10 earns 5 SOLE a minute.',
  },
  {
    label: 'Durability loss',
    value: 0.3,
    fractionDigits: 1,
    unit: 'per minute',
    explanation: 'Rounded up per run, so a 10-minute run costs 3.',
  },
  {
    label: 'Repair',
    value: 0.7,
    fractionDigits: 1,
    unit: 'SOLE / point',
    explanation: 'At level 1, plus 0.1 SOLE per point for each level above 1.',
  },
  {
    label: 'Upgrade',
    value: 50,
    fractionDigits: 0,
    unit: 'SOLE × level',
    explanation: 'Each level adds 2 efficiency.',
  },
  {
    label: 'Max level',
    value: 30,
    fractionDigits: 0,
    unit: 'levels',
    explanation: 'A Sneaker can be upgraded up to level 30.',
  },
]

export type StarterSneakerStat = {
  label: string
  value: number
}

export const starterSneakerStats: readonly StarterSneakerStat[] = [
  { label: 'Level', value: 1 },
  { label: 'Efficiency', value: 10 },
  { label: 'Durability', value: 100 },
  { label: 'Energy', value: 10 },
]

export const rulesContent = {
  metaLabels: ['SneakerGame', 'Launch config'],
  heading: 'The rules are on-chain',
  starterSneakerLabel: 'Starter Sneaker',
  footnote: 'The contract enforces these. The app only estimates.',
} as const
