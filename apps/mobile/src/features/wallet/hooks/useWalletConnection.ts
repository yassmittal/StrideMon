import { useAppKit } from '@reown/appkit-react-native'
import { useCallback } from 'react'
import { useAccount } from 'wagmi'

/** The external wallet connected through AppKit, and the actions to change it. */
export function useWalletConnection() {
  const { address: walletAddress, isConnected } = useAccount()
  const { open, disconnect } = useAppKit()

  const openWalletPicker = useCallback(() => open({ view: 'Connect' }), [open])
  const disconnectWallet = useCallback(() => disconnect(), [disconnect])

  return { walletAddress, isConnected, openWalletPicker, disconnectWallet }
}
