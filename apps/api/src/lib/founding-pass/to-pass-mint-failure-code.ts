import type { FoundingPassMintFailureCode } from '@stridemon/shared/domain'

/**
 * Why a mint the chain refused failed, from its revert reason (`PassAlreadyMinted(137)`), so the
 * website can say what to do next. `null` means it reverted on-chain without a reason.
 */
export function toPassMintFailureCode(revertReason: string | null): FoundingPassMintFailureCode {
  if (revertReason?.startsWith('PassAlreadyMinted(')) return 'PASS_ALREADY_MINTED'
  if (revertReason?.startsWith('FoundingPassAlreadyHeld(')) return 'PASS_WALLET_ALREADY_USED'
  return 'PASS_MINT_FAILED'
}
