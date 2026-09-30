import { Stack } from 'expo-router'

export default function RunLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* No swipe-back mid-run: leaving goes through STOP, or Home's Resume / Finish. */}
      <Stack.Screen name="active" options={{ gestureEnabled: false }} />
    </Stack>
  )
}
