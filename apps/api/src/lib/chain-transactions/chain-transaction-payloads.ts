import { tokenIdStringSchema, walletAddressSchema } from '@stridemon/shared/api-contracts'
import { z } from 'zod'

const mongoObjectIdSchema = z.string().regex(/^[0-9a-f]{24}$/, 'must be a Mongo object id')

/** Arguments of a `mintStarterSneaker` outbox record. */
export const mintStarterSneakerPayloadSchema = z.object({
  walletAddress: walletAddressSchema,
})
export type MintStarterSneakerPayload = z.infer<typeof mintStarterSneakerPayloadSchema>

/** Arguments of a `sendGasDrip` outbox record. Wei as a decimal string (data-model.md). */
export const sendGasDripPayloadSchema = z.object({
  walletAddress: walletAddressSchema,
  amountWei: z.string().regex(/^[1-9]\d*$/, 'must be a positive whole number of wei'),
})
export type SendGasDripPayload = z.infer<typeof sendGasDripPayloadSchema>

/** Arguments of a `settleSession` outbox record (D-026). */
export const settleSessionPayloadSchema = z.object({
  activitySessionId: mongoObjectIdSchema,
  onChainSessionId: z.string().regex(/^0x[0-9a-f]{64}$/, 'must be a bytes32 hex string'),
  sneakerTokenId: tokenIdStringSchema,
  walletAddress: walletAddressSchema,
  activeMinutes: z.int().positive(),
  distanceMeters: z.int().nonnegative(),
})
export type SettleSessionPayload = z.infer<typeof settleSessionPayloadSchema>

/** Arguments of a `mintFoundingPass` outbox record (D-043). */
export const mintFoundingPassPayloadSchema = z.object({
  mintId: mongoObjectIdSchema,
  walletAddress: walletAddressSchema,
  designNumber: z.int().min(1),
})
export type MintFoundingPassPayload = z.infer<typeof mintFoundingPassPayloadSchema>

/** Arguments of a `mintFounderSneaker` outbox record: the pass, and who held it when queued. */
export const mintFounderSneakerPayloadSchema = z.object({
  foundingPassTokenId: tokenIdStringSchema,
  walletAddress: walletAddressSchema,
})
export type MintFounderSneakerPayload = z.infer<typeof mintFounderSneakerPayloadSchema>

/** Arguments of a `laceFoundingPass` outbox record. */
export const laceFoundingPassPayloadSchema = z.object({
  foundingPassTokenId: tokenIdStringSchema,
})
export type LaceFoundingPassPayload = z.infer<typeof laceFoundingPassPayloadSchema>

/** One starter Sneaker per wallet, ever: the key the outbox dedupes on. */
export function buildStarterSneakerIdempotencyKey(walletAddress: string): string {
  return `mintStarterSneaker:${walletAddress.toLowerCase()}`
}

/** One gas drip per wallet, ever (security.md). */
export function buildGasDripIdempotencyKey(walletAddress: string): string {
  return `sendGasDrip:${walletAddress.toLowerCase()}`
}

/** One settlement per activity session: retrying finish can never settle twice. */
export function buildSessionSettlementIdempotencyKey(activitySessionId: string): string {
  return `settleSession:${activitySessionId}`
}

/** One transaction per mint request: a failed mint frees its design for someone else (D-043). */
export function buildFoundingPassMintIdempotencyKey(mintId: string): string {
  return `mintFoundingPass:${mintId}`
}

/** One Founder Sneaker per pass (the contract refuses a second, too). */
export function buildFounderSneakerIdempotencyKey(foundingPassTokenId: bigint): string {
  return `mintFounderSneaker:${foundingPassTokenId}`
}

/** A pass is laced once. */
export function buildFoundingPassLacingIdempotencyKey(foundingPassTokenId: bigint): string {
  return `laceFoundingPass:${foundingPassTokenId}`
}
