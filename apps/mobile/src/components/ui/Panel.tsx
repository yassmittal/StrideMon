import type { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import { colors, radii, spacing } from '../../theme'

type PanelProps = {
  children: ReactNode
}

/** design-system.md §8: a white card on the off-white page. Stack panels with a small gap. */
export function Panel({ children }: PanelProps) {
  return <View style={styles.panel}>{children}</View>
}

const styles = StyleSheet.create({
  panel: {
    padding: spacing.large,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
    gap: spacing.medium,
  },
})
