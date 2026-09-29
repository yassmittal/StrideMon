import type { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import { colors, radii, spacing } from '../../theme'

type CardProps = {
  children: ReactNode
}

/** A raised surface that groups related content. Becomes design-system.md's `Panel` in Phase 8. */
export function Card({ children }: CardProps) {
  return <View style={styles.card}>{children}</View>
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.large,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
    gap: spacing.medium,
  },
})
