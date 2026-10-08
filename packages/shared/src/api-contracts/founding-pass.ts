import { z } from 'zod'
import {
  FOUNDING_PASS_DESIGN_COUNT,
  FOUNDING_PASS_MINT_FAILURE_CODES,
  FOUNDING_PASS_MINT_STATUSES,
  PASS_SCHEDULE_PHASES,
} from '../domain/founding-pass'
import { emailAddressSchema } from './email-address'
import { transactionHashSchema } from './onboarding'
import { walletAddressSchema } from './wallet-address'

// Cloudflare's tokens are about 2 KB; anything far longer isn't one.
const MAX_TURNSTILE_TOKEN_LENGTH = 4096
const EMAIL_CODE_PATTERN = /^\d{6}$/
// A signed JWT; the API checks the signature, this only bounds the size.
const MAX_EMAIL_PROOF_LENGTH = 2048

/** A pass's design number, which is also its token id (1 to 1,000). */
export const designNumberSchema = z.int().min(1).max(FOUNDING_PASS_DESIGN_COUNT)

/** The token Cloudflare Turnstile's widget gives the page. */
const turnstileTokenSchema = z.string().min(1).max(MAX_TURNSTILE_TOKEN_LENGTH)

export const sendPassEmailCodeBodySchema = z.object({
  email: emailAddressSchema,
  turnstileToken: turnstileTokenSchema,
})
export type SendPassEmailCodeBody = z.infer<typeof sendPassEmailCodeBodySchema>

/** The same answer for every email, so the route never reveals who has a pass or is waiting. */
export const sendPassEmailCodeResponseSchema = z.object({
  status: z.literal('sent'),
})
export type SendPassEmailCodeResponse = z.infer<typeof sendPassEmailCodeResponseSchema>

export const verifyPassEmailCodeBodySchema = z.object({
  email: emailAddressSchema,
  code: z.string().trim().regex(EMAIL_CODE_PATTERN, 'must be the 6-digit code'),
})
export type VerifyPassEmailCodeBody = z.infer<typeof verifyPassEmailCodeBodySchema>

export const verifyPassEmailCodeResponseSchema = z.object({
  /** Sent back with the mint, so "Get ready" can happen hours before it (D-043). */
  emailProof: z.string(),
  emailProofExpiresAt: z.iso.datetime(),
})
export type VerifyPassEmailCodeResponse = z.infer<typeof verifyPassEmailCodeResponseSchema>

export const requestFoundingPassMintBodySchema = z.object({
  designNumber: designNumberSchema,
  emailProof: z.string().min(1).max(MAX_EMAIL_PROOF_LENGTH),
  turnstileToken: turnstileTokenSchema,
})
export type RequestFoundingPassMintBody = z.infer<typeof requestFoundingPassMintBodySchema>

export const foundingPassMintParamsSchema = z.object({
  mintId: z.string().regex(/^[0-9a-f]{24}$/, 'must be a mint id'),
})
export type FoundingPassMintParams = z.infer<typeof foundingPassMintParamsSchema>

export const foundingPassMintSchema = z.object({
  mintId: z.string(),
  designNumber: designNumberSchema,
  status: z.enum(FOUNDING_PASS_MINT_STATUSES),
  /** Set once the outbox signs the mint, so the reveal can link to the explorer while it waits. */
  transactionHash: transactionHashSchema.nullable(),
  /** The mint order ("Founder 42"), once confirmed. */
  founderNumber: z.int().positive().nullable(),
  hasGoldFrame: z.boolean().nullable(),
  /** Why a `failed` mint failed. Nothing was minted. */
  failureCode: z.enum(FOUNDING_PASS_MINT_FAILURE_CODES).nullable(),
  createdAt: z.iso.datetime(),
  mintedAt: z.iso.datetime().nullable(),
})
export type FoundingPassMint = z.infer<typeof foundingPassMintSchema>

export const foundingPassMintResponseSchema = z.object({
  mint: foundingPassMintSchema,
})
export type FoundingPassMintResponse = z.infer<typeof foundingPassMintResponseSchema>

export const passScheduleSchema = z.object({
  phase: z.enum(PASS_SCHEDULE_PHASES),
  /** When the clock changes the phase next. `null` once all are minted or the app is open to all. */
  nextPhaseAt: z.iso.datetime().nullable(),
  waitlistWindowStartsAt: z.iso.datetime(),
  openMintStartsAt: z.iso.datetime(),
  backupOpeningAt: z.iso.datetime(),
})
export type PassSchedule = z.infer<typeof passScheduleSchema>

export const recentFoundingPassMintSchema = z.object({
  designNumber: designNumberSchema,
  /** EIP-55 checksummed. */
  walletAddress: walletAddressSchema,
  founderNumber: z.int().positive(),
  mintedAt: z.iso.datetime(),
})
export type RecentFoundingPassMint = z.infer<typeof recentFoundingPassMintSchema>

export const foundingPassCollectionResponseSchema = z.object({
  designCount: z.int().positive(),
  /** On-chain, read at most every few seconds. */
  mintedCount: z.int().nonnegative(),
  /** Ascending, from `FoundingPass.mintedBitmap()`. */
  mintedDesignNumbers: z.array(designNumberSchema),
  /** Mints the chain doesn't show yet: queued, or confirmed since the last chain read. */
  pendingDesignNumbers: z.array(designNumberSchema),
  /** The last 10 confirmed mints, newest first. */
  recentMints: z.array(recentFoundingPassMintSchema),
  schedule: passScheduleSchema,
  /** While on, only pass holders get a Sneaker in the app. */
  isEarlyAccessGateOn: z.boolean(),
})
export type FoundingPassCollectionResponse = z.infer<typeof foundingPassCollectionResponseSchema>
