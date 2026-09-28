import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'

type AppProvidersProps = {
  children: ReactNode
}

/** Every app-wide provider, composed once. The wallet providers join in Phase 2. */
export function AppProviders({ children }: AppProvidersProps) {
  // useState so the client survives re-renders but is never shared between tests.
  const [queryClient] = useState(() => new QueryClient())

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SafeAreaProvider>
  )
}
