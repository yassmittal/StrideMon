import {
  type AuthNonceResponse,
  type AuthTokensResponse,
  authNonceResponseSchema,
  authTokensResponseSchema,
  type VerifyAuthSignatureBody,
} from '@stridemon/shared/api-contracts'
import { z } from 'zod'
import { requestJson } from '../../../lib/api-client'

export function requestAuthNonce(walletAddress: string): Promise<AuthNonceResponse> {
  return requestJson({
    method: 'POST',
    path: '/v1/auth/nonce',
    body: { walletAddress },
    responseSchema: authNonceResponseSchema,
  })
}

export function verifyAuthSignature(
  verifyAuthSignatureBody: VerifyAuthSignatureBody,
): Promise<AuthTokensResponse> {
  return requestJson({
    method: 'POST',
    path: '/v1/auth/verify',
    body: verifyAuthSignatureBody,
    responseSchema: authTokensResponseSchema,
  })
}

export function refreshAuthTokens(refreshToken: string): Promise<AuthTokensResponse> {
  return requestJson({
    method: 'POST',
    path: '/v1/auth/refresh',
    body: { refreshToken },
    responseSchema: authTokensResponseSchema,
  })
}

/** Revokes this device's auth session on the server. Answers 204 with no body. */
export async function revokeAuthSession(refreshToken: string): Promise<void> {
  await requestJson({
    method: 'POST',
    path: '/v1/auth/sign-out',
    body: { refreshToken },
    responseSchema: z.null(),
    requiresAuthentication: true,
  })
}
