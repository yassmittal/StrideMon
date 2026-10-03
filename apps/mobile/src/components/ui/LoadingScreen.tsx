import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { colors, spacing, textStyles } from '../../theme'

type LoadingScreenProps = {
  accessibilityLabel: string
  /** Says what it's waiting on, when that takes long enough to wonder. */
  message?: string
}

/** A whole screen that is waiting on something, such as restoring the auth session at launch. */
export function LoadingScreen({ accessibilityLabel, message }: LoadingScreenProps) {
  return (
    <View style={styles.container} accessibilityLabel={accessibilityLabel}>
      <ActivityIndicator size="large" color={colors.textPrimary} />
      {message !== undefined && <Text style={styles.message}>{message}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.medium,
    backgroundColor: colors.background,
  },
  message: {
    ...textStyles.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
})
