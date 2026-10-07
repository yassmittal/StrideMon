import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useWalletConnection } from '../../wallet/hooks/useWalletConnection'
import { deleteCurrentUser } from '../api/current-user-api'
import { endAuthSessionOnThisDevice } from '../auth-session'

/**
 * Deletes the player's off-chain data (D-039), then signs out here like `useSignOut`. The server
 * already deleted every auth session, so there's nothing left to revoke.
 */
export function useDeleteAccount() {
  const queryClient = useQueryClient()
  const { disconnectWallet } = useWalletConnection()
  return useMutation({
    mutationFn: deleteCurrentUser,
    onSuccess: async () => {
      await endAuthSessionOnThisDevice()
      disconnectWallet()
      queryClient.clear()
    },
  })
}
