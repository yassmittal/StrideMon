import {
  authNonceResponseSchema,
  authTokensResponseSchema,
  refreshAuthTokensBodySchema,
  requestAuthNonceBodySchema,
  signOutBodySchema,
  verifyAuthSignatureBodySchema,
} from '@stridemon/shared/api-contracts'
import { z } from 'zod'

export const requestAuthNonceRouteSchema = {
  tags: ['auth'],
  summary: 'Issue a one-time nonce and return the SIWE message to sign',
  body: requestAuthNonceBodySchema,
  response: { 200: authNonceResponseSchema },
}

export const verifyAuthSignatureRouteSchema = {
  tags: ['auth'],
  summary: 'Verify the signed SIWE message and start an auth session',
  body: verifyAuthSignatureBodySchema,
  response: { 200: authTokensResponseSchema },
}

export const refreshAuthTokensRouteSchema = {
  tags: ['auth'],
  summary: 'Rotate the refresh token and issue a new access token',
  body: refreshAuthTokensBodySchema,
  response: { 200: authTokensResponseSchema },
}

export const signOutRouteSchema = {
  tags: ['auth'],
  summary: 'Revoke the auth session behind this refresh token',
  security: [{ bearerAuth: [] }],
  body: signOutBodySchema,
  response: { 204: z.null() },
}
