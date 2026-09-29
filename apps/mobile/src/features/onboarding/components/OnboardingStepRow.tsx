import type { OnboardingStep } from '@stridemon/shared/api-contracts'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { ExternalLink } from '../../../components/ui/ExternalLink'
import { buildTransactionExplorerUrl } from '../../../lib/chain/explorer-urls'
import { colors, fontSizes, spacing } from '../../../theme'

// Wide enough for the spinner, so the step labels line up whatever the indicator is.
const INDICATOR_WIDTH = 24

type OnboardingStepRowProps = {
  label: string
  step: OnboardingStep
  statusText: { pending: string; confirmed: string; failed: string }
}

/** One onboarding transaction: its state, in words, and its explorer link once signed. */
export function OnboardingStepRow({ label, step, statusText }: OnboardingStepRowProps) {
  const description = describeStepStatus(step, statusText)
  return (
    <View style={styles.row}>
      <StepIndicator step={step} />
      <View style={styles.text} accessible accessibilityLabel={`${label}: ${description}`}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.status, step.status === 'failed' && styles.statusFailed]}>
          {description}
        </Text>
      </View>
      {step.transactionHash !== null && (
        <ExternalLink
          label="View"
          accessibilityLabel={`${label}: view the transaction on the explorer`}
          url={buildTransactionExplorerUrl(step.transactionHash)}
        />
      )}
    </View>
  )
}

function StepIndicator({ step }: { step: OnboardingStep }) {
  switch (step.status) {
    case 'pending':
      return <ActivityIndicator color={colors.primary} style={styles.indicator} />
    case 'confirmed':
      return <Text style={[styles.indicator, styles.indicatorConfirmed]}>✓</Text>
    case 'failed':
      return <Text style={[styles.indicator, styles.indicatorFailed]}>!</Text>
    case 'notStarted':
      return <Text style={[styles.indicator, styles.indicatorNotStarted]}>•</Text>
    default: {
      const unhandledStatus: never = step.status
      throw new Error(`Unhandled onboarding step status: ${String(unhandledStatus)}`)
    }
  }
}

function describeStepStatus(
  step: OnboardingStep,
  statusText: OnboardingStepRowProps['statusText'],
): string {
  switch (step.status) {
    case 'notStarted':
      return 'Not requested yet'
    case 'pending':
      return statusText.pending
    case 'confirmed':
      return statusText.confirmed
    case 'failed':
      return statusText.failed
    default: {
      const unhandledStatus: never = step.status
      throw new Error(`Unhandled onboarding step status: ${String(unhandledStatus)}`)
    }
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.medium,
  },
  text: {
    flex: 1,
    gap: spacing.extraSmall,
  },
  label: {
    fontSize: fontSizes.body,
    color: colors.textPrimary,
  },
  status: {
    fontSize: fontSizes.caption,
    color: colors.textSecondary,
  },
  statusFailed: {
    color: colors.danger,
  },
  indicator: {
    width: INDICATOR_WIDTH,
    textAlign: 'center',
    fontSize: fontSizes.title,
  },
  indicatorConfirmed: {
    color: colors.success,
  },
  indicatorFailed: {
    color: colors.danger,
  },
  indicatorNotStarted: {
    color: colors.textSecondary,
  },
})
