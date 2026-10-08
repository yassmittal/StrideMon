/** How many Founding Pass designs there are, numbered 1 to 1,000 (`FoundingPass.DESIGN_COUNT`). */
export const FOUNDING_PASS_DESIGN_COUNT = 1000

/**
 * Where the Founding Pass schedule is (D-041, D-043). Minting is open in `waitlistWindow` (waitlist
 * emails only) and `openMint`. The early-access gate goes off in `allMinted` and `openToAll`.
 */
export const PASS_SCHEDULE_PHASES = [
  'preview',
  'waitlistWindow',
  'openMint',
  'allMinted',
  'openToAll',
] as const

export type PassSchedulePhase = (typeof PASS_SCHEDULE_PHASES)[number]

/** Where one mint request is (data-model.md → foundingPassMints). */
export const FOUNDING_PASS_MINT_STATUSES = ['queued', 'confirmed', 'failed'] as const

export type FoundingPassMintStatus = (typeof FOUNDING_PASS_MINT_STATUSES)[number]

/** Why a mint failed after it was accepted. Each is also an `ApiErrorCode`. */
export const FOUNDING_PASS_MINT_FAILURE_CODES = [
  'PASS_ALREADY_MINTED',
  'PASS_WALLET_ALREADY_USED',
  'PASS_MINT_FAILED',
] as const

export type FoundingPassMintFailureCode = (typeof FOUNDING_PASS_MINT_FAILURE_CODES)[number]

/** Which free Sneaker a wallet gets: a Founder Sneaker for a pass holder, otherwise a normal one. */
export const STARTER_SNEAKER_KINDS = ['normal', 'founder'] as const

export type StarterSneakerKind = (typeof STARTER_SNEAKER_KINDS)[number]
