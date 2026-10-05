import { Stack } from 'expo-router'

// With app/index.tsx gone, "/" is Home, which a signed-out player can't open. The
// root stack then falls back to this group, and this makes that land on welcome.
export const unstable_settings = {
  anchor: 'welcome',
}

export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false }} />
}
