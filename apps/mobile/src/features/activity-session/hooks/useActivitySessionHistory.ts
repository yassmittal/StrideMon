import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchActivitySessionPage } from '../api/activity-sessions-api'

export const ACTIVITY_SESSION_HISTORY_QUERY_KEY = ['activity-session-history'] as const

const FIRST_PAGE_CURSOR: string | null = null

/** The player's past runs, newest first, loading a page at a time as the list scrolls. */
export function useActivitySessionHistory() {
  const historyQuery = useInfiniteQuery({
    queryKey: ACTIVITY_SESSION_HISTORY_QUERY_KEY,
    queryFn: ({ pageParam }) => fetchActivitySessionPage(pageParam),
    initialPageParam: FIRST_PAGE_CURSOR,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
  return {
    ...historyQuery,
    activitySessions: historyQuery.data?.pages.flatMap((page) => page.items),
  }
}
