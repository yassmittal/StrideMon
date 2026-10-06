import { joinWaitlistBodySchema, joinWaitlistResponseSchema } from '@stridemon/shared/api-contracts'

export const joinWaitlistRouteSchema = {
  tags: ['waitlist'],
  summary: 'Add an email to the landing page waitlist',
  body: joinWaitlistBodySchema,
  response: { 200: joinWaitlistResponseSchema },
}
