import NetInfo from '@react-native-community/netinfo'
import { onlineManager } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'

/**
 * Tells React Query when the phone goes offline, so requests wait and run on reconnect
 * instead of failing (D-032). Only `isConnected`: the laptop API on a LAN has no internet,
 * so `isInternetReachable` would read as offline.
 */
export function syncOnlineStatusWithNetInfo(): void {
  onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((networkState) => setOnline(networkState.isConnected !== false)),
  )
}

export function useIsOnline(): boolean {
  return useSyncExternalStore(
    (onOnlineChange) => onlineManager.subscribe(onOnlineChange),
    () => onlineManager.isOnline(),
  )
}
