import { useEffect } from 'react'
import { restoreAuthSession } from '../auth-session'
import { type AuthSession, setAuthSession, useAuthSessionStore } from '../auth-session-store'

export function useAuthSession(): AuthSession {
  return useAuthSessionStore((state) => state.authSession)
}

/**
 * Run once, in the root layout: restores the session from the stored refresh
 * token. The API client is connected to the auth session earlier, in index.ts.
 */
export function useRestoreAuthSessionOnLaunch(): void {
  useEffect(() => {
    restoreAuthSession().catch((error: unknown) => {
      // Secure storage itself failed. Onboarding is the one screen that still works.
      console.error('Restoring the auth session failed', error)
      setAuthSession({ status: 'signedOut' })
    })
  }, [])
}
