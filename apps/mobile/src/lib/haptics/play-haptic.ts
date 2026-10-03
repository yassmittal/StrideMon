import * as Haptics from 'expo-haptics'

// A phone without a vibration motor (or with haptics off) rejects; the tap still worked.
function ignoreHapticFailure(error: unknown) {
  console.warn('Haptic feedback failed', error)
}

/** START: the run began and GPS is on. */
export function playRunStartedHaptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(ignoreHapticFailure)
}

/** STOP: the player confirmed finishing the run. */
export function playRunStoppedHaptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(ignoreHapticFailure)
}

/** Something landed on Monad: a settled run, a repair, an upgrade, a transfer. */
export function playSuccessHaptic() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(ignoreHapticFailure)
}
