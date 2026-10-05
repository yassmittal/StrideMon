import { StyleSheet, Text, View } from 'react-native'
import { colors, fontFamilies, textStyles } from '../../../theme'

export type StatChange = {
  label: string
  valueBefore: string
  valueAfter: string
}

/** "Efficiency   10 → 12": what a repair or upgrade changes. */
export function StatChangeRow({ label, valueBefore, valueAfter }: StatChange) {
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`${label}: ${valueBefore} to ${valueAfter}`}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.values}>
        <Text style={styles.valueBefore}>{valueBefore}</Text>
        <Text style={styles.arrow}>{'  →  '}</Text>
        <Text style={styles.valueAfter}>{valueAfter}</Text>
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
  values: {
    ...textStyles.body,
    fontFamily: fontFamilies.monoRegular,
  },
  valueBefore: {
    color: colors.textSecondary,
  },
  arrow: {
    color: colors.accent,
  },
  valueAfter: {
    color: colors.textPrimary,
  },
})
