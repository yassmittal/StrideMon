import {
  activitySessionPageSchema,
  activitySessionParamsSchema,
  activitySessionResponseSchema,
  listActivitySessionsQuerySchema,
  startActivitySessionBodySchema,
  uploadLocationSamplesBodySchema,
  uploadLocationSamplesResponseSchema,
} from '@stridemon/shared/api-contracts'

export const startActivitySessionRouteSchema = {
  tags: ['activity-sessions'],
  summary: 'Start a walk or run with one of your Sneakers',
  security: [{ bearerAuth: [] }],
  body: startActivitySessionBodySchema,
  response: { 201: activitySessionResponseSchema },
}

export const uploadLocationSamplesRouteSchema = {
  tags: ['activity-sessions'],
  summary: 'Upload a batch of GPS samples (idempotent by sequence number)',
  security: [{ bearerAuth: [] }],
  params: activitySessionParamsSchema,
  body: uploadLocationSamplesBodySchema,
  response: { 200: uploadLocationSamplesResponseSchema },
}

export const finishActivitySessionRouteSchema = {
  tags: ['activity-sessions'],
  summary: 'End the session and validate it (idempotent)',
  security: [{ bearerAuth: [] }],
  params: activitySessionParamsSchema,
  response: { 200: activitySessionResponseSchema },
}

export const readActivitySessionRouteSchema = {
  tags: ['activity-sessions'],
  summary: 'One of your activity sessions',
  security: [{ bearerAuth: [] }],
  params: activitySessionParamsSchema,
  response: { 200: activitySessionResponseSchema },
}

export const listActivitySessionsRouteSchema = {
  tags: ['activity-sessions'],
  summary: 'Your activity sessions, newest first (cursor-paginated)',
  security: [{ bearerAuth: [] }],
  querystring: listActivitySessionsQuerySchema,
  response: { 200: activitySessionPageSchema },
}
