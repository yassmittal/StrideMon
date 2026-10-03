import { StyleSheet, Text } from 'react-native'
import { colors, textStyles } from '../../theme'

type MetaLabelProps = {
  items: readonly string[]
  tone?: 'light' | 'dark'
}

/** design-system.md §8: tiny uppercase metadata joined by bullets, `LEVEL 3 • EFFICIENCY 12`. */
export function MetaLabel({ items, tone = 'light' }: MetaLabelProps) {
  return (
    <Text style={[styles.label, tone === 'dark' && styles.labelOnDark]}>{items.join('  •  ')}</Text>
  )
}

const styles = StyleSheet.create({
  label: {
    ...textStyles.caption,
    color: colors.textPrimary,
    textTransform: 'uppercase',
  },
  labelOnDark: {
    color: colors.textOnDark,
  },
})
