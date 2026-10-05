import { useQuery } from '@tanstack/react-query'
import { fetchCurrentUser } from '../api/current-user-api'

export const CURRENT_USER_QUERY_KEY = ['current-user'] as const

export function useCurrentUser() {
  return useQuery({ queryKey: CURRENT_USER_QUERY_KEY, queryFn: fetchCurrentUser })
}
