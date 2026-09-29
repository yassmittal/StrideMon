import { z } from 'zod'
import { walletAddressSchema } from './wallet-address'

export const currentUserSchema = z.object({
  userId: z.string(),
  /** EIP-55 checksummed, for display. */
  walletAddress: walletAddressSchema,
  hasReceivedStarterSneaker: z.boolean(),
  hasReceivedGasDrip: z.boolean(),
  createdAt: z.iso.datetime(),
})
export type CurrentUser = z.infer<typeof currentUserSchema>

export const currentUserResponseSchema = z.object({
  user: currentUserSchema,
})
export type CurrentUserResponse = z.infer<typeof currentUserResponseSchema>
