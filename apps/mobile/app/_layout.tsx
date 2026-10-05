import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { LoadingScreen } from '../src/components/ui/LoadingScreen'
import {
  useAuthSession,
  useRestoreAuthSessionOnLaunch,
} from '../src/features/auth/hooks/useAuthSession'
import { AppProviders } from '../src/providers/AppProviders'
import { fontFiles } from '../src/theme'

// Text waits for its font and never flashes a fallback (design-system.md §3.1).
void SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [areFontsLoaded, fontLoadError] = useFonts(fontFiles)
  const isReadyToShow = areFontsLoaded || fontLoadError !== null

  useEffect(() => {
    if (fontLoadError !== null) console.error('Loading the fonts failed', fontLoadError)
    if (isReadyToShow) void SplashScreen.hideAsync()
  }, [isReadyToShow, fontLoadError])

  // A font that failed to load falls back to the system font rather than blocking the app.
  if (!isReadyToShow) return null

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
        <Stack.Screen name="run" />
        <Stack.Screen name="sneaker/transfer" />
      </Stack.Protected>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
    </Stack>
  )
}
