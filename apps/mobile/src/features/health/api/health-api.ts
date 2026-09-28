import { type HealthResponse, healthResponseSchema } from '@stridemon/shared/api-contracts'
import { requestJson } from '../../../lib/api-client'

export function fetchApiHealth(): Promise<HealthResponse> {
  return requestJson({ method: 'GET', path: '/health', responseSchema: healthResponseSchema })
}
