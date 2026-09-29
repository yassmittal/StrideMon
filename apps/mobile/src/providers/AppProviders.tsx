import { AppKit, AppKitProvider } from '@reown/appkit-react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { WagmiProvider } from 'wagmi'
import { appKit, wagmiAdapter } from '../lib/chain/app-kit'

type AppProvidersProps = {
  children: ReactNode
}

/** Every app-wide provider, composed once. */
export function AppProviders({ children }: AppProvidersProps) {
  // useState so the client survives re-renders but is never shared between tests.
  const [queryClient] = useState(() => new QueryClient())

  return (
    <SafeAreaProvider>
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <AppKitProvider instance={appKit}>
            {children}
            {/* A full-screen layer above navigation, so the wallet modal opens on Android
                (expo/expo#32991). box-none lets touches through while it's closed. */}
            <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
              <AppKit />
            </View>
          </AppKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </SafeAreaProvider>
  )
}
