import type { RevealShotName } from './timeline'

// Every word and Sneaker the One thing film adds (FACTS.md §20). The Sneaker is #0137 Rose Hiker
// Night, the other films' hero, as the frozen design table has it (DESIGNS_FROZEN_ON).

export const ONE_THING_DESIGN_NUMBER = 137

/**
 * The gold captions in place of the reference's "418m²", "OF LAND" and "R3,500,000 📍 HOUT BAY".
 * `pinned` is the line under the main one, after a map pin, as the reference's place name.
 */
export const revealCaptions: Record<RevealShotName, { main: string; pinned: string | null }> = {
  strideMon: { main: 'StrideMon', pinned: null },
  sneaker: { main: 'Sneaker', pinned: null },
  /** The Founding Pass mints free (founding-pass.ts, "How it works"), on Monad testnet. */
  free: { main: 'Free', pinned: 'Monad testnet' },
}

export const oneThingContent = {
  wordmark: 'StrideMon',
  /** Yash's ask: "waitlist yourself now". */
  headline: 'Join the waitlist now',
  /**
   * The waitlist mints 48 hours before the open mint, and the pass is the early access
   * (founding-pass.ts). A no-break space keeps "48 hours" on one line.
   */
  body: 'Mint your Founding Pass 48 hours before everyone else. It’s your early access to StrideMon.',
  link: 'stridemon.xyz/pass',
} as const
