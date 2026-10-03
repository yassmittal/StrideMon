import { StatusBar } from 'expo-status-bar'
import type { ReactNode } from 'react'
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, readPageGutter, spacing } from '../../theme'

type ScreenProps = {
  children: ReactNode
  /** For screens whose content can outgrow a small phone, such as Home. */
  isScrollable?: boolean
  /** `dark` flips the whole screen to black, like Lusion's dark sections. */
  tone?: 'light' | 'dark'
}

/** The outer frame of every screen: safe-area insets, background and Lusion's page gutter. */
export function Screen({ children, isScrollable = false, tone = 'light' }: ScreenProps) {
  const { width: windowWidth } = useWindowDimensions()
  const pageGutterStyle = { paddingHorizontal: readPageGutter(windowWidth) }
  const isDark = tone === 'dark'

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.safeAreaDark]}>
      {isDark && <StatusBar style="light" />}
      {isScrollable ? (
        // `handled`: a tap on a button works while the keyboard is open, e.g. a text field's arrow.
        <ScrollView
          contentContainerStyle={[styles.content, pageGutterStyle]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, pageGutterStyle, styles.fill]}>{children}</View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeAreaDark: {
    backgroundColor: colors.darkBackground,
  },
  content: {
    paddingVertical: spacing.medium,
    gap: spacing.small,
  },
  fill: {
    flex: 1,
  },
})
