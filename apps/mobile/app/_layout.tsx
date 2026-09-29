import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { LoadingScreen } from '../src/components/ui/LoadingScreen'
import {
  useAuthSession,
  useRestoreAuthSessionOnLaunch,
} from '../src/features/auth/hooks/useAuthSession'
import { AppProviders } from '../src/providers/AppProviders'

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <AuthGate />
    </AppProviders>
  )
}

/** Signed in → tabs; otherwise → onboarding. Flipping either way drops the other side's history. */
function AuthGate() {
  useRestoreAuthSessionOnLaunch()
  const authSession = useAuthSession()

  if (authSession.status === 'restoring') {
    return <LoadingScreen accessibilityLabel="Loading StrideMon" />
  }

  const isSignedIn = authSession.status === 'signedIn'
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
    </Stack>
  )
}
