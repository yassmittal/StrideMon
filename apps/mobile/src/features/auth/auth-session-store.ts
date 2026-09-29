import { create } from 'zustand'

/**
 * Whether the player is signed in on this device. `restoring` lasts from launch
 * until the stored refresh token has been checked. A signed-in player can have no
 * access token yet (offline at launch); the API client fetches one when needed.
 */
export type AuthSession =
  | { status: 'restoring' }
  | { status: 'signedOut' }
  | { status: 'signedIn'; accessToken: string | null }

export const useAuthSessionStore = create<{ authSession: AuthSession }>(() => ({
  authSession: { status: 'restoring' },
}))

export function setAuthSession(authSession: AuthSession): void {
  useAuthSessionStore.setState({ authSession })
}

export function readAccessToken(): string | null {
  const { authSession } = useAuthSessionStore.getState()
  return authSession.status === 'signedIn' ? authSession.accessToken : null
}
