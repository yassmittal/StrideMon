import {
  foundingPassCollectionResponseSchema,
  foundingPassMintParamsSchema,
  foundingPassMintResponseSchema,
  requestFoundingPassMintBodySchema,
  sendPassEmailCodeBodySchema,
  sendPassEmailCodeResponseSchema,
  verifyPassEmailCodeBodySchema,
  verifyPassEmailCodeResponseSchema,
} from '@stridemon/shared/api-contracts'

export const sendPassEmailCodeRouteSchema = {
  tags: ['founding-pass'],
  summary: 'Email a 6-digit code (Turnstile first; the same answer for every email)',
  body: sendPassEmailCodeBodySchema,
  response: { 200: sendPassEmailCodeResponseSchema },
}

export const verifyPassEmailCodeRouteSchema = {
  tags: ['founding-pass'],
  summary: 'Check a code and get a signed email proof',
  body: verifyPassEmailCodeBodySchema,
  response: { 200: verifyPassEmailCodeResponseSchema },
}

export const requestFoundingPassMintRouteSchema = {
  tags: ['founding-pass'],
  summary: 'Queue a Founding Pass mint for the signed-in wallet',
  security: [{ bearerAuth: [] }],
  body: requestFoundingPassMintBodySchema,
  response: { 200: foundingPassMintResponseSchema, 201: foundingPassMintResponseSchema },
}

export const readFoundingPassMintRouteSchema = {
  tags: ['founding-pass'],
  summary: 'One of the wallet’s mints, for the reveal',
  security: [{ bearerAuth: [] }],
  params: foundingPassMintParamsSchema,
  response: { 200: foundingPassMintResponseSchema },
}

export const readFoundingPassCollectionRouteSchema = {
  tags: ['founding-pass'],
  summary: 'Minted and pending designs, the last 10 mints, the schedule and the gate',
  response: { 200: foundingPassCollectionResponseSchema },
}
