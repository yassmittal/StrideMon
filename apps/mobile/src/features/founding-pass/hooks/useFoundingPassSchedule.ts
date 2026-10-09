import { useQuery } from '@tanstack/react-query'
import { fetchFoundingPassCollection } from '../api/founding-pass-api'

export const FOUNDING_PASS_COLLECTION_QUERY_KEY = ['founding-pass-collection'] as const

// The phase changes on a schedule set days ahead; once a minute notices opening day soon enough.
const COLLECTION_POLL_INTERVAL_MILLISECONDS = 60_000

/** The mint's phase and times, and whether the gate is on, for the gate screen. */
export function useFoundingPassSchedule() {
  return useQuery({
    queryKey: FOUNDING_PASS_COLLECTION_QUERY_KEY,
    queryFn: fetchFoundingPassCollection,
    refetchInterval: COLLECTION_POLL_INTERVAL_MILLISECONDS,
  })
}
