import { StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useIsOnline } from '../../lib/network/online-status'
import { colors, fontFamilies, radii, spacing, textStyles } from '../../theme'

/** A small dark pill at the top while the phone is offline. Touches pass through it. */
export function OfflineNotice() {
  const isOnline = useIsOnline()
  const { top: topInset } = useSafeAreaInsets()
  if (isOnline) return null

  return (
    <View style={[styles.layer, { top: topInset + spacing.extraSmall }]} pointerEvents="none">
      <Text style={styles.pill} accessibilityRole="alert" accessibilityLiveRegion="polite">
        Offline · waiting for a connection
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pill: {
    ...textStyles.label,
    fontFamily: fontFamilies.medium,
    color: colors.textOnDark,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    overflow: 'hidden',
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.extraSmall,
    textTransform: 'uppercase',
  },
})
