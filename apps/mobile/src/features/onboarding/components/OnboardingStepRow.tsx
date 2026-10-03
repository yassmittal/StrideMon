import type { OnboardingStep } from '@stridemon/shared/api-contracts'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { ExternalLink } from '../../../components/ui/ExternalLink'
import { buildTransactionExplorerUrl } from '../../../lib/chain/explorer-urls'
import { colors, spacing, textStyles } from '../../../theme'

// Wide enough for the spinner, so the step labels line up whatever the indicator is.
const INDICATOR_WIDTH = 24

type OnboardingStepRowProps = {
  label: string
  step: OnboardingStep
  statusText: { pending: string; confirmed: string; failed: string }
}

/** One onboarding transaction on the black minting screen: its state, and its explorer link once signed. */
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
          tone="onDark"
        />
      )}
    </View>
  )
}

function StepIndicator({ step }: { step: OnboardingStep }) {
  switch (step.status) {
    case 'pending':
      return <ActivityIndicator color={colors.textOnDark} style={styles.indicatorBox} />
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
    paddingVertical: spacing.medium,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.overlayOnDark,
  },
  text: {
    flex: 1,
    gap: spacing.extraSmall,
  },
  label: {
    ...textStyles.body,
    color: colors.textOnDark,
  },
  status: {
    ...textStyles.caption,
    color: colors.textOnDarkMuted,
    textTransform: 'uppercase',
  },
  statusFailed: {
    color: colors.dangerAccent,
  },
  indicatorBox: {
    width: INDICATOR_WIDTH,
  },
  indicator: {
    ...textStyles.title,
    width: INDICATOR_WIDTH,
    textAlign: 'center',
  },
  indicatorConfirmed: {
    color: colors.highlight,
  },
  indicatorFailed: {
    color: colors.dangerAccent,
  },
  indicatorNotStarted: {
    color: colors.textOnDarkMuted,
  },
})
