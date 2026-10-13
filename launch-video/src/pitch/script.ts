// The pitch video's script (Metropolis "Pitch video", ≤ 2 minutes). Each line is spoken and shown
// as one caption. `speech` is only for macOS `say` (the scratch track), where the written form
// reads wrong. Every claim is from docs/hackathon-submission.md (the dashboard copy) or
// launch-video/FACTS.md; the "why" lines are Yash's own (2026-10-14).
//
// scripts/pitch-voice.ts reads this file to make the scratch track and src/pitch/voice-timing.json.
// No React or Remotion imports here: Bun runs it outside the bundle.

export const pitchSceneIds = ['hook', 'problem', 'solution', 'monad', 'why', 'next', 'end'] as const
export type PitchSceneId = (typeof pitchSceneIds)[number]

export type PitchLine = { scene: PitchSceneId; text: string; speech?: string }

export const pitchLines: readonly PitchLine[] = [
  { scene: 'hook', text: 'Your daily walk should count for something.' },
  {
    scene: 'hook',
    text: 'I’m Yash Mittal, a Web3 developer,',
    speech: "I'm Yash Mittal, a Web 3 developer,",
  },
  { scene: 'hook', text: 'and I built StrideMon on my own for Metropolis.' },

  {
    scene: 'problem',
    text: 'Step counters give you a number, and that’s it.',
    speech: "Step counters give you a number, and that's it.",
  },
  { scene: 'problem', text: 'Move-to-earn games usually make you buy an NFT and a token first.' },
  { scene: 'problem', text: 'So people who just want to walk or run are left out.' },

  { scene: 'solution', text: 'StrideMon is free to start.' },
  { scene: 'solution', text: 'Sign in with your wallet, and you get a free Sneaker NFT' },
  {
    scene: 'solution',
    text: 'and a little testnet MON to pay for gas.',
    speech: 'and a little testnet mon to pay for gas.',
  },
  {
    scene: 'solution',
    text: 'Go for a walk, then press STOP.',
    speech: 'Go for a walk, then press stop.',
  },
  { scene: 'solution', text: 'Your run is saved on Monad,' },
  {
    scene: 'solution',
    text: 'and you get STRIDE in your wallet.',
    speech: 'and you get Stride in your wallet.',
  },
  {
    scene: 'solution',
    text: 'Use STRIDE to repair your Sneaker or level it up.',
    speech: 'Use Stride to repair your Sneaker or level it up.',
  },

  { scene: 'monad', text: 'Why Monad?' },
  {
    scene: 'monad',
    text: 'It’s fast, so every run can be its own transaction.',
    speech: "It's fast, so every run can be its own transaction.",
  },
  { scene: 'monad', text: 'Gas is cheap, so we can give new players free gas.' },
  {
    scene: 'monad',
    text: 'And it works like Ethereum, so MetaMask just works.',
  },

  {
    scene: 'why',
    text: 'I’m building this for people who love to work out and want to connect that with Web3.',
    speech:
      "I'm building this for people who love to work out and want to connect that with Web 3.",
  },
  {
    scene: 'why',
    text: 'Owning a Sneaker on-chain gives them a reason to keep walking and running.',
    speech: 'Owning a Sneaker on chain gives them a reason to keep walking and running.',
  },

  {
    scene: 'next',
    text: 'Next: 1,000 free Founding Passes.',
    speech: 'Next. One thousand free Founding Passes.',
  },
  {
    scene: 'next',
    text: 'Each one has its own design, drawn on-chain, and it can’t be sold.',
    speech: "Each one has its own design, drawn on chain, and it can't be sold.",
  },
  { scene: 'next', text: 'The app is in review on Google Play.' },
  {
    scene: 'next',
    text: 'Join the waitlist at stridemon.xyz.',
    speech: 'Join the waitlist at stride mon dot x y z.',
  },

  {
    scene: 'end',
    text: 'Monad testnet. STRIDE has no monetary value.',
    speech: 'Monad testnet. Stride has no monetary value.',
  },
  { scene: 'end', text: 'Thanks for watching.' },
]
