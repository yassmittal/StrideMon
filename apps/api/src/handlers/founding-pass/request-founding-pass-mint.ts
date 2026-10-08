import type { StrideMonContractAddresses } from '@stridemon/chain'
import { FOUNDING_PASS_DESIGNS } from '@stridemon/chain/founding-pass-designs'
import type {
  FoundingPassMintResponse,
  RequestFoundingPassMintBody,
} from '@stridemon/shared/api-contracts'
import type { Db } from 'mongodb'
import type { PublicClient } from 'viem'
import { ApiError } from '../../common/api-error'
import {
  buildFoundingPassMintIdempotencyKey,
  type MintFoundingPassPayload,
} from '../../lib/chain-transactions/chain-transaction-payloads'
import { verifyEmailProof } from '../../lib/founding-pass/email-proof'
import { findSimilarAvailableDesignNumbers } from '../../lib/founding-pass/minted-designs'
import { calculatePassSchedulePosition } from '../../lib/founding-pass/pass-schedule'
import type { AuthenticatedUser } from '../../plugins/authentication'
import type { ApiConfig } from '../../plugins/env'
import { enqueueChainTransaction } from '../../repositories/chain-transactions-repository'
import {
  type FoundingPassMintDocument,
  findLiveFoundingPassMintByEmail,
  findLiveFoundingPassMintByWallet,
  insertFoundingPassMint,
  listPendingFoundingPassDesignNumbers,
  markFoundingPassMintFailed,
} from '../../repositories/founding-pass-mints-repository'
import type {
  CachedFoundingPassCollectionReader,
  CachedFoundingPassCollectionState,
} from '../../services/cached-founding-pass-collection-reader'
import { findFoundingPassTokenIdHeldBy } from '../../services/founding-pass-chain-reader'
import type { TurnstileVerifier } from '../../services/turnstile-verifier'
import { assertPassMintingOpen } from './assert-pass-minting-open'
import { assertTurnstileTokenValid } from './assert-turnstile-token-valid'
import { buildFoundingPassMintResponse } from './to-founding-pass-mint'

const SIMILAR_DESIGN_COUNT = 3
const HTTP_STATUS_UNAUTHORIZED = 401
const HTTP_STATUS_CONFLICT = 409

type RequestFoundingPassMintResult = FoundingPassMintResponse & { isNewMint: boolean }

/**
 * Queues a Founding Pass mint (backend-api.md → The Founding Pass). The checks run cheapest and
 * most useful first; the database's unique indexes settle a race for a design. A repeat from the
 * same wallet for the same design answers that mint again (D-043).
 */
export async function requestFoundingPassMint({
  database,
  apiConfig,
  publicClient,
  contractAddresses,
  collectionReader,
  turnstileVerifier,
  authenticatedUser,
  body,
  remoteIpAddress,
  now,
}: {
  database: Db
  apiConfig: ApiConfig
  publicClient: PublicClient
  contractAddresses: StrideMonContractAddresses
  collectionReader: CachedFoundingPassCollectionReader
  turnstileVerifier: TurnstileVerifier
  authenticatedUser: AuthenticatedUser
  body: RequestFoundingPassMintBody
  remoteIpAddress: string
  now: Date
}): Promise<RequestFoundingPassMintResult> {
  await assertTurnstileTokenValid({
    turnstileVerifier,
    turnstileToken: body.turnstileToken,
    remoteIpAddress,
  })
  const email = await verifyEmailProof({
    emailProof: body.emailProof,
    emailProofSecret: apiConfig.emailProofSecret,
    now,
  })
  if (email === null) throw new ApiError('EMAIL_PROOF_INVALID', HTTP_STATUS_UNAUTHORIZED)

  const collectionState = await collectionReader.read(now)
  await assertPassMintingOpen({
    database,
    schedulePosition: calculatePassSchedulePosition({
      scheduleTimes: apiConfig.passScheduleTimes,
      mintedCount: collectionState.mintedCount,
      now,
    }),
    scheduleTimes: apiConfig.passScheduleTimes,
    email,
  })

  const { designNumber } = body
  const mintRequest = {
    designNumber,
    email,
    walletAddress: authenticatedUser.walletAddress.toLowerCase(),
  }
  const repeatedMint = await findRepeatOrAssertNoPass(database, {
    ...mintRequest,
    heldFoundingPassTokenId: await findFoundingPassTokenIdHeldBy(
      { publicClient, contractAddresses },
      authenticatedUser.walletAddress,
    ),
  })
  if (repeatedMint !== null) return buildRepeatedMintResult(database, repeatedMint)
  if (collectionState.mintedDesignNumbers.includes(designNumber)) {
    throw await buildPassAlreadyMintedError(database, { designNumber, collectionState })
  }

  const insertResult = await insertFoundingPassMint(database, { ...mintRequest, now })
  if ('conflict' in insertResult) {
    // Another request inserted first: this same one again (a double tap), or a rival.
    const racedMint = await findRepeatOrAssertNoPass(database, {
      ...mintRequest,
      heldFoundingPassTokenId: null,
    })
    if (racedMint !== null) return buildRepeatedMintResult(database, racedMint)
    throw await buildPassAlreadyMintedError(database, { designNumber, collectionState })
  }

  const { foundingPassMint } = insertResult
  await enqueueFoundingPassMint(database, { foundingPassMint, now })
  return { ...(await buildFoundingPassMintResponse(database, foundingPassMint)), isNewMint: true }
}

type MintRequest = { designNumber: number; email: string; walletAddress: string }

/**
 * One pass per wallet (our mints, then the chain, which also knows passes minted or recovered
 * outside the API) and per email. A live mint that is this very request (same wallet, email and
 * design) comes back instead, so a repeat answers it again.
 */
async function findRepeatOrAssertNoPass(
  database: Db,
  {
    heldFoundingPassTokenId,
    ...mintRequest
  }: MintRequest & { heldFoundingPassTokenId: bigint | null },
): Promise<FoundingPassMintDocument | null> {
  const walletMint = await findLiveFoundingPassMintByWallet(database, mintRequest.walletAddress)
  if (walletMint !== null) {
    if (isSameMintRequest(walletMint, mintRequest)) return walletMint
    throw new ApiError('PASS_WALLET_ALREADY_USED', HTTP_STATUS_CONFLICT, {
      designNumber: walletMint.designNumber,
      mintId: walletMint._id.toHexString(),
    })
  }
  if (heldFoundingPassTokenId !== null) {
    throw new ApiError('PASS_WALLET_ALREADY_USED', HTTP_STATUS_CONFLICT, {
      designNumber: Number(heldFoundingPassTokenId),
      mintId: null,
    })
  }
  const emailMint = await findLiveFoundingPassMintByEmail(database, mintRequest.email)
  if (emailMint !== null) {
    if (isSameMintRequest(emailMint, mintRequest)) return emailMint
    throw new ApiError('PASS_EMAIL_ALREADY_USED', HTTP_STATUS_CONFLICT, {
      designNumber: emailMint.designNumber,
    })
  }
  return null
}

function isSameMintRequest(foundingPassMint: FoundingPassMintDocument, mintRequest: MintRequest) {
  return (
    foundingPassMint.walletAddress === mintRequest.walletAddress &&
    foundingPassMint.email === mintRequest.email &&
    foundingPassMint.designNumber === mintRequest.designNumber
  )
}

async function buildRepeatedMintResult(
  database: Db,
  repeatedMint: FoundingPassMintDocument,
): Promise<RequestFoundingPassMintResult> {
  return { ...(await buildFoundingPassMintResponse(database, repeatedMint)), isNewMint: false }
}

/** "#0137 was just minted", with 3 similar designs still free to mint in one tap. */
async function buildPassAlreadyMintedError(
  database: Db,
  {
    designNumber,
    collectionState,
  }: { designNumber: number; collectionState: CachedFoundingPassCollectionState },
): Promise<ApiError> {
  const pendingDesignNumbers = await listPendingFoundingPassDesignNumbers(database, {
    confirmedSince: collectionState.readAt,
  })
  return new ApiError('PASS_ALREADY_MINTED', HTTP_STATUS_CONFLICT, {
    designNumber,
    similarAvailableDesignNumbers: findSimilarAvailableDesignNumbers({
      designNumber,
      designs: FOUNDING_PASS_DESIGNS,
      takenDesignNumbers: new Set([
        ...collectionState.mintedDesignNumbers,
        ...pendingDesignNumbers,
      ]),
      count: SIMILAR_DESIGN_COUNT,
    }),
  })
}

async function enqueueFoundingPassMint(
  database: Db,
  { foundingPassMint, now }: { foundingPassMint: FoundingPassMintDocument; now: Date },
): Promise<void> {
  const mintId = foundingPassMint._id.toHexString()
  const mintPayload: MintFoundingPassPayload = {
    mintId,
    walletAddress: foundingPassMint.walletAddress,
    designNumber: foundingPassMint.designNumber,
  }
  try {
    await enqueueChainTransaction(database, {
      kind: 'mintFoundingPass',
      idempotencyKey: buildFoundingPassMintIdempotencyKey(mintId),
      payload: mintPayload,
      now,
    })
  } catch (error) {
    // Without its transaction the mint would hold the design forever: free it.
    await markFoundingPassMintFailed(database, {
      mintId: foundingPassMint._id,
      failureCode: 'PASS_MINT_FAILED',
      now,
    })
    throw error
  }
}
