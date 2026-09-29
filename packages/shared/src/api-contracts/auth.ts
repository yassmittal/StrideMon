import { z } from 'zod'
import { currentUserSchema } from './me'
import { walletAddressSchema } from './wallet-address'

export const requestAuthNonceBodySchema = z.object({
  walletAddress: walletAddressSchema,
})
export type RequestAuthNonceBody = z.infer<typeof requestAuthNonceBodySchema>

export const authNonceResponseSchema = z.object({
  /** The complete EIP-4361 message. The app has the wallet sign it exactly as sent. */
  message: z.string(),
})
export type AuthNonceResponse = z.infer<typeof authNonceResponseSchema>

export const verifyAuthSignatureBodySchema = z.object({
  message: z.string().min(1),
  signature: z.string().regex(/^0x[0-9a-fA-F]+$/, 'must be a 0x-prefixed hex signature'),
})
export type VerifyAuthSignatureBody = z.infer<typeof verifyAuthSignatureBodySchema>

export const refreshAuthTokensBodySchema = z.object({
  refreshToken: z.string().min(1),
})
export type RefreshAuthTokensBody = z.infer<typeof refreshAuthTokensBodySchema>

export const signOutBodySchema = z.object({
  refreshToken: z.string().min(1),
})
export type SignOutBody = z.infer<typeof signOutBodySchema>

/** Returned by both verify and refresh. The refresh token is single-use: store the new one. */
export const authTokensResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: currentUserSchema,
})
export type AuthTokensResponse = z.infer<typeof authTokensResponseSchema>
