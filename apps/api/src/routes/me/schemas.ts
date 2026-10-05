import { currentUserResponseSchema } from '@stridemon/shared/api-contracts'

export const readCurrentUserRouteSchema = {
  tags: ['me'],
  summary: 'The signed-in user and their onboarding state',
  security: [{ bearerAuth: [] }],
  response: { 200: currentUserResponseSchema },
}
