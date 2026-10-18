import {
  joinWaitlistBodySchema,
  joinWaitlistResponseSchema,
  startWaitlistInvitesSessionBodySchema,
  waitlistCountResponseSchema,
  waitlistInvitesResponseSchema,
  waitlistInvitesSessionResponseSchema,
} from '@stridemon/shared/api-contracts'

export const joinWaitlistRouteSchema = {
  tags: ['waitlist'],
  summary: 'Add an email to the waitlist and answer its invite link',
  body: joinWaitlistBodySchema,
  response: { 200: joinWaitlistResponseSchema },
}

export const startWaitlistInvitesSessionRouteSchema = {
  tags: ['waitlist'],
  summary: 'Check an email proof, confirm the sign-up and answer its invites with a 30-day token',
  body: startWaitlistInvitesSessionBodySchema,
  response: { 200: waitlistInvitesSessionResponseSchema },
}

export const readWaitlistInvitesRouteSchema = {
  tags: ['waitlist'],
  summary: 'A sign-up’s invites, with the invites token as a bearer token',
  security: [{ bearerAuth: [] }],
  response: { 200: waitlistInvitesResponseSchema },
}

export const readWaitlistCountRouteSchema = {
  tags: ['waitlist'],
  summary: 'How many people are on the waitlist (cached about a minute)',
  response: { 200: waitlistCountResponseSchema },
}
