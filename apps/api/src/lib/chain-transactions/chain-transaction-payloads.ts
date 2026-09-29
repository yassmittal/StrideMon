import { walletAddressSchema } from '@stridemon/shared/api-contracts'
import { z } from 'zod'

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

/** One starter Sneaker per wallet, ever: the key the outbox dedupes on. */
export function buildStarterSneakerIdempotencyKey(walletAddress: string): string {
  return `mintStarterSneaker:${walletAddress.toLowerCase()}`
}

/** One gas drip per wallet, ever (security.md). */
export function buildGasDripIdempotencyKey(walletAddress: string): string {
  return `sendGasDrip:${walletAddress.toLowerCase()}`
}
