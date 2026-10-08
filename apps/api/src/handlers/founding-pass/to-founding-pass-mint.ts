import type { FoundingPassMint, FoundingPassMintResponse } from '@stridemon/shared/api-contracts'
import type { Db } from 'mongodb'
import { buildFoundingPassMintIdempotencyKey } from '../../lib/chain-transactions/chain-transaction-payloads'
import {
  type ChainTransactionDocument,
  findChainTransactionByIdempotencyKey,
} from '../../repositories/chain-transactions-repository'
import type { FoundingPassMintDocument } from '../../repositories/founding-pass-mints-repository'

/** The `{ mint }` both mint routes answer, with its outbox record's hash while it's pending. */
export async function buildFoundingPassMintResponse(
  database: Db,
  foundingPassMint: FoundingPassMintDocument,
): Promise<FoundingPassMintResponse> {
  const mintTransaction = await findChainTransactionByIdempotencyKey(
    database,
    buildFoundingPassMintIdempotencyKey(foundingPassMint._id.toHexString()),
  )
  return { mint: toFoundingPassMint(foundingPassMint, mintTransaction) }
}

/** A mint as the API shows it. The hash comes from the outbox until the mint confirms. */
export function toFoundingPassMint(
  foundingPassMint: FoundingPassMintDocument,
  mintTransaction: ChainTransactionDocument | null,
): FoundingPassMint {
  return {
    mintId: foundingPassMint._id.toHexString(),
    designNumber: foundingPassMint.designNumber,
    status: foundingPassMint.status,
    transactionHash: foundingPassMint.transactionHash ?? mintTransaction?.transactionHash ?? null,
    founderNumber: foundingPassMint.founderNumber,
    hasGoldFrame: foundingPassMint.hasGoldFrame,
    failureCode: foundingPassMint.failureCode,
    createdAt: foundingPassMint.createdAt.toISOString(),
    mintedAt: foundingPassMint.mintedAt?.toISOString() ?? null,
  }
}
