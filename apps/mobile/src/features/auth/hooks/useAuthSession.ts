import { useEffect } from 'react'
import { registerAccessTokenSource } from '../../../lib/api-client'
import { authSessionAccessTokenSource, restoreAuthSession } from '../auth-session'
import { type AuthSession, setAuthSession, useAuthSessionStore } from '../auth-session-store'

export function useAuthSession(): AuthSession {
  return useAuthSessionStore((state) => state.authSession)
}

/**
 * Run once, in the root layout: connects the API client to the auth session and
 * restores the session from the stored refresh token.
 */
export function useRestoreAuthSessionOnLaunch(): void {
  useEffect(() => {
    registerAccessTokenSource(authSessionAccessTokenSource)
    restoreAuthSession().catch((error: unknown) => {
      // Secure storage itself failed. Onboarding is the one screen that still works.
      console.error('Restoring the auth session failed', error)
      setAuthSession({ status: 'signedOut' })
    })
  }, [])
}
