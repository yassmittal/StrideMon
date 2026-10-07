import {
  type CurrentUserResponse,
  currentUserResponseSchema,
} from '@stridemon/shared/api-contracts'
import { z } from 'zod'
import { requestJson } from '../../../lib/api-client'

export function fetchCurrentUser(): Promise<CurrentUserResponse> {
  return requestJson({
    method: 'GET',
    path: '/v1/me',
    responseSchema: currentUserResponseSchema,
    requiresAuthentication: true,
  })
}

/** Deletes the player's off-chain data (D-039). Sneakers and STRIDE stay in the wallet. */
export async function deleteCurrentUser(): Promise<void> {
  await requestJson({
    method: 'DELETE',
    path: '/v1/me',
    responseSchema: z.null(),
    requiresAuthentication: true,
  })
}
