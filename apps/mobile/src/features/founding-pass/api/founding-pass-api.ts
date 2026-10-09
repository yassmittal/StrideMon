import {
  type FoundingPassCollectionResponse,
  foundingPassCollectionResponseSchema,
} from '@stridemon/shared/api-contracts'
import { requestJson } from '../../../lib/api-client'

/** The schedule's phase and times, the minted count and whether the gate is on. Public: no sign-in. */
export function fetchFoundingPassCollection(): Promise<FoundingPassCollectionResponse> {
  return requestJson({
    method: 'GET',
    path: '/v1/pass/collection',
    responseSchema: foundingPassCollectionResponseSchema,
  })
}
