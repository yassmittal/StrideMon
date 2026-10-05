import { StyleSheet, Text, View } from 'react-native'
import { Button } from '../../../components/ui/Button'
import { MetaLabel } from '../../../components/ui/MetaLabel'
import { colors, spacing, textStyles } from '../../../theme'
import type { LocationPermissionState } from '../location-tracking/request-location-permission'

type LocationPermissionExplainerProps = {
  permissionState: LocationPermissionState
  onContinuePress: () => void
  onOpenSettingsPress: () => void
  onNotNowPress: () => void
  isBusy: boolean
  errorMessage: string | null
}

/**
 * Shown before the OS location prompt (security.md → Privacy): why StrideMon
 * needs location, and which answer to pick. D-020: "while using the app" is enough.
 */
export function LocationPermissionExplainer({
  permissionState,
  onContinuePress,
  onOpenSettingsPress,
  onNotNowPress,
  isBusy,
  errorMessage,
}: LocationPermissionExplainerProps) {
  const isBlocked = permissionState === 'blocked'
  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        Location for your runs
      </Text>
      <Text style={styles.body}>
        StrideMon measures your time, distance and speed with GPS, and only while a run is in
        progress. Recording keeps going with the screen locked, and a notification shows while it
        does.
      </Text>
      <Text style={styles.body}>Choose “While using the app” when your phone asks.</Text>
      <View style={styles.privacyNote}>
        <MetaLabel items={['Privacy']} />
        <Text style={styles.caption}>
          Your route stays private. Only your active minutes and distance go on Monad, and the raw
          GPS points are deleted from our server after 30 days.
        </Text>
      </View>
      {permissionState === 'denied' && (
        <Text style={styles.error} accessibilityRole="alert">
          Without location access StrideMon can’t record a run.
        </Text>
      )}
      {isBlocked && (
        <Text style={styles.error} accessibilityRole="alert">
          Location access is turned off for StrideMon. Allow it in Settings, then come back.
        </Text>
      )}
      {errorMessage !== null && (
        <Text style={styles.error} accessibilityRole="alert">
          {errorMessage}
        </Text>
      )}
      <View style={styles.actions}>
        {isBlocked ? (
          <Button label="Open Settings" onPress={onOpenSettingsPress} />
        ) : (
          <Button label="Continue" onPress={onContinuePress} isLoading={isBusy} />
        )}
        <Button label="Not now" variant="secondary" onPress={onNotNowPress} isDisabled={isBusy} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.medium,
  },
  title: {
    ...textStyles.title,
    color: colors.textPrimary,
  },
  body: {
    ...textStyles.body,
    color: colors.textPrimary,
  },
  privacyNote: {
    gap: spacing.extraSmall,
  },
  caption: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
  error: {
    ...textStyles.body,
    color: colors.danger,
  },
  actions: {
    gap: spacing.small,
  },
})
