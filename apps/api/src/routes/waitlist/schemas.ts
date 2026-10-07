import {
  joinWaitlistBodySchema,
  joinWaitlistResponseSchema,
  readWaitlistPlaceQuerySchema,
  verifyWaitlistEmailBodySchema,
  waitlistPlaceResponseSchema,
} from '@stridemon/shared/api-contracts'

export const joinWaitlistRouteSchema = {
  tags: ['waitlist'],
  summary: 'Add an email to the landing page waitlist and email it a verification code',
  body: joinWaitlistBodySchema,
  response: { 200: joinWaitlistResponseSchema },
}

export const verifyWaitlistEmailRouteSchema = {
  tags: ['waitlist'],
  summary: 'Check the emailed code and answer the place in the Founding Pass line',
  body: verifyWaitlistEmailBodySchema,
  response: { 200: waitlistPlaceResponseSchema },
}

export const readWaitlistPlaceRouteSchema = {
  tags: ['waitlist'],
  summary: 'A verified sign-up’s place in the Founding Pass line, by its referral code',
  querystring: readWaitlistPlaceQuerySchema,
  response: { 200: waitlistPlaceResponseSchema },
}
