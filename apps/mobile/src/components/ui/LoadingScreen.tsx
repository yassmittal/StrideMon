import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { colors } from '../../theme'

type LoadingScreenProps = {
  accessibilityLabel: string
}

/** A whole screen that is waiting on something, such as restoring the auth session at launch. */
export function LoadingScreen({ accessibilityLabel }: LoadingScreenProps) {
  return (
    <View style={styles.container} accessibilityLabel={accessibilityLabel}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
})
