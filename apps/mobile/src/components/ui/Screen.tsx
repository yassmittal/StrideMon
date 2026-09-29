import type { ReactNode } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing } from '../../theme'

type ScreenProps = {
  children: ReactNode
  /** For screens whose content can outgrow a small phone, such as Home. */
  isScrollable?: boolean
}

/** The outer frame of every screen: safe-area insets, background and padding. */
export function Screen({ children, isScrollable = false }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      {isScrollable ? (
        <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
      ) : (
        <View style={[styles.content, styles.fill]}>{children}</View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.large,
    gap: spacing.medium,
  },
  fill: {
    flex: 1,
  },
})
