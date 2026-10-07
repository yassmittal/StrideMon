import { currentUserResponseSchema } from '@stridemon/shared/api-contracts'
import { z } from 'zod'

export const readCurrentUserRouteSchema = {
  tags: ['me'],
  summary: 'The signed-in user and their onboarding state',
  security: [{ bearerAuth: [] }],
  response: { 200: currentUserResponseSchema },
}

export const deleteCurrentUserRouteSchema = {
  tags: ['me'],
  summary: 'Delete the signed-in player’s off-chain data. On-chain Sneakers and STRIDE stay',
  security: [{ bearerAuth: [] }],
  response: { 204: z.null() },
}
