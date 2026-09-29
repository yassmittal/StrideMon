import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { useWalletConnection } from '../../wallet/hooks/useWalletConnection'
import { signOutOfAuthSession } from '../auth-session'

/** Revokes the auth session, forgets it on this device, disconnects the wallet and clears cached data. */
export function useSignOut() {
  const queryClient = useQueryClient()
  const { disconnectWallet } = useWalletConnection()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const signOut = useCallback(async () => {
    setIsSigningOut(true)
    try {
      await signOutOfAuthSession()
    } catch (error) {
      // Signed out here regardless; the server session expires on its own.
      console.warn('Revoking the auth session on the server failed', error)
    } finally {
      disconnectWallet()
      queryClient.clear()
      setIsSigningOut(false)
    }
  }, [disconnectWallet, queryClient])

  return { signOut, isSigningOut }
}
