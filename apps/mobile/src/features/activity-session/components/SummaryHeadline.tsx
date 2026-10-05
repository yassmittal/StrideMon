import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { MetaLabel } from '../../../components/ui/MetaLabel'
import { colors, readOpticalPullLeft, spacing, textStyles } from '../../../theme'

type SummaryHeadlineProps = {
  metaItems: readonly string[]
  title: string
  message: string
  isLoading?: boolean
  isError?: boolean
}

/** The top of a run summary that isn't a reward: settling, checking, or why it didn't count. */
export function SummaryHeadline({
  metaItems,
  title,
  message,
  isLoading = false,
  isError = false,
}: SummaryHeadlineProps) {
  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <View style={styles.metaRow}>
        {isLoading && <ActivityIndicator color={colors.textPrimary} />}
        <MetaLabel items={metaItems} />
      </View>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Text style={[styles.message, isError && styles.messageError]}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.medium,
    paddingVertical: spacing.extraLarge,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
  },
  title: {
    ...textStyles.heading,
    marginLeft: readOpticalPullLeft(textStyles.heading.fontSize),
    color: colors.textPrimary,
  },
  message: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
  messageError: {
    color: colors.danger,
  },
})
