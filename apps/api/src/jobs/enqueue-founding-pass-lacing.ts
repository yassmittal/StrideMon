import type { StrideMonContractAddresses } from '@stridemon/chain'
import type { Db } from 'mongodb'
import { getAddress, type PublicClient } from 'viem'
import {
  buildFoundingPassLacingIdempotencyKey,
  type LaceFoundingPassPayload,
} from '../lib/chain-transactions/chain-transaction-payloads'
import { enqueueChainTransaction } from '../repositories/chain-transactions-repository'
import {
  findFoundingPassTokenIdHeldBy,
  readFoundingPassRecord,
} from '../services/founding-pass-chain-reader'

/**
 * After a wallet's settled walk: if it holds a pass that isn't laced yet, queue `setLaced` (D-041,
 * D-043). Every later settlement finds it laced, or its key already queued, and adds nothing.
 */
export async function enqueueFoundingPassLacingIfDue({
  database,
  publicClient,
  contractAddresses,
  walletAddress,
  now,
}: {
  database: Db
  publicClient: PublicClient
  contractAddresses: StrideMonContractAddresses
  walletAddress: string
  now: Date
}): Promise<void> {
  const chainReaderContext = { publicClient, contractAddresses }
  const foundingPassTokenId = await findFoundingPassTokenIdHeldBy(
    chainReaderContext,
    getAddress(walletAddress),
  )
  if (foundingPassTokenId === null) return
  const foundingPassRecord = await readFoundingPassRecord(chainReaderContext, foundingPassTokenId)
  if (foundingPassRecord.isLaced) return

  const lacingPayload: LaceFoundingPassPayload = {
    foundingPassTokenId: foundingPassTokenId.toString(),
  }
  await enqueueChainTransaction(database, {
    kind: 'laceFoundingPass',
    idempotencyKey: buildFoundingPassLacingIdempotencyKey(foundingPassTokenId),
    payload: lacingPayload,
    now,
  })
}
