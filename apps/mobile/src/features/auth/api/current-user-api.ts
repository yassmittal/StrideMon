import {
  type CurrentUserResponse,
  currentUserResponseSchema,
} from '@stridemon/shared/api-contracts'
import { requestJson } from '../../../lib/api-client'

export function fetchCurrentUser(): Promise<CurrentUserResponse> {
  return requestJson({
    method: 'GET',
    path: '/v1/me',
    responseSchema: currentUserResponseSchema,
    requiresAuthentication: true,
  })
}
