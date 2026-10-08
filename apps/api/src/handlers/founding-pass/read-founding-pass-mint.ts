import type { FoundingPassMintResponse } from '@stridemon/shared/api-contracts'
import { type Db, ObjectId } from 'mongodb'
import { ApiError } from '../../common/api-error'
import type { AuthenticatedUser } from '../../plugins/authentication'
import { findFoundingPassMintById } from '../../repositories/founding-pass-mints-repository'
import { buildFoundingPassMintResponse } from './to-founding-pass-mint'

const HTTP_STATUS_NOT_FOUND = 404

/** One of the wallet's mints, for the reveal. Another wallet's mint is a 404, so ids can't be probed. */
export async function readFoundingPassMint({
  database,
  authenticatedUser,
  mintId,
}: {
  database: Db
  authenticatedUser: AuthenticatedUser
  mintId: string
}): Promise<FoundingPassMintResponse> {
  const foundingPassMint = await findFoundingPassMintById(database, new ObjectId(mintId))
  if (
    foundingPassMint === null ||
    foundingPassMint.walletAddress !== authenticatedUser.walletAddress.toLowerCase()
  ) {
    throw new ApiError('NOT_FOUND', HTTP_STATUS_NOT_FOUND, { mintId })
  }
  return buildFoundingPassMintResponse(database, foundingPassMint)
}
