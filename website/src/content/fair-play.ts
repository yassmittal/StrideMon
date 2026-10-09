export type InformationColumn = {
  label: string
  heading: string
  points: readonly string[]
}

export const fairPlayContent = {
  heading: 'Checked before it pays. Private by design.',
} as const

export const fairPlayColumns: readonly InformationColumn[] = [
  {
    label: 'Fair play',
    heading: 'Every run is checked before it pays.',
    points: [
      'A minute only counts at 1–20 km/h on average, so idling and riding in a car earn nothing.',
      'Jumps faster than 40 km/h between GPS fixes are dropped.',
      'Mock locations are rejected (Android).',
      'The server validates the run, then the contract settles it once and only once.',
    ],
  },
  {
    label: 'Privacy',
    heading: 'Your route stays yours.',
    points: [
      'Only your active minutes and distance go on-chain, never your route.',
      'Raw GPS samples are deleted after 30 days.',
      'Your wallet is your account: no email, no password.',
    ],
  },
]
