import { StyleSheet, Text, View } from 'react-native'
import { colors, readOpticalPullLeft, spacing, textStyles } from '../../theme'
import { MetaLabel } from './MetaLabel'

type ScreenTitleProps = {
  title: string
  /** A `MetaLabel` row above the title, such as `MONAD TESTNET`. */
  metaItems?: readonly string[]
  tone?: 'light' | 'dark'
}

/** The big sentence-case title at the top of a tab or screen, pulled left like Lusion's headlines. */
export function ScreenTitle({ title, metaItems, tone = 'light' }: ScreenTitleProps) {
  return (
    <View style={styles.container}>
      {metaItems !== undefined && <MetaLabel items={metaItems} tone={tone} />}
      <Text
        style={[styles.title, tone === 'dark' && styles.titleOnDark]}
        accessibilityRole="header"
      >
        {title}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.extraSmall,
    paddingBottom: spacing.small,
  },
  title: {
    ...textStyles.heading,
    marginLeft: readOpticalPullLeft(textStyles.heading.fontSize),
    color: colors.textPrimary,
  },
  titleOnDark: {
    color: colors.textOnDark,
  },
})
