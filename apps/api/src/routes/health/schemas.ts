import { healthResponseSchema } from '@stridemon/shared/api-contracts'

export const readHealthRouteSchema = {
  tags: ['health'],
  summary: 'Liveness, plus whether MongoDB answers',
  response: { 200: healthResponseSchema },
}
