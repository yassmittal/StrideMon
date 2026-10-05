import type { ReactNode } from 'react'
import { StyleSheet, useWindowDimensions, View } from 'react-native'
import { colors, layout, radii, spacing } from '../../theme'

type HeroPanelProps = {
  children: ReactNode
}

/** design-system.md §8: the dark panel the Sneaker sits on, about half the first screen tall. */
export function HeroPanel({ children }: HeroPanelProps) {
  const { height: windowHeight } = useWindowDimensions()
  return (
    <View style={[styles.panel, { minHeight: windowHeight * layout.heroPanelMinimumHeightRatio }]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  panel: {
    padding: spacing.large,
    borderRadius: radii.medium,
    backgroundColor: colors.darkPanel,
    justifyContent: 'space-between',
    gap: spacing.large,
    overflow: 'hidden',
  },
})
