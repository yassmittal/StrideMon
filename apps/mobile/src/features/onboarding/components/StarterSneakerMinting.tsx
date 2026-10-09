import type { OnboardingStep } from '@stridemon/shared/api-contracts'
import type { StarterSneakerKind } from '@stridemon/shared/domain'
import { StyleSheet, Text, View } from 'react-native'
import { CounterText } from '../../../components/ui/CounterText'
import { ErrorState } from '../../../components/ui/ErrorState'
import { ExternalLink } from '../../../components/ui/ExternalLink'
import { MetaLabel } from '../../../components/ui/MetaLabel'
import { foundingPassHelpUrl } from '../../../config/website-urls'
import { colors, spacing, textStyles } from '../../../theme'
import {
  describeStarterSneakerRequestError,
  type StarterSneakerMintingState,
} from '../starter-sneaker-minting-state'
import { OnboardingStepRow } from './OnboardingStepRow'

type StarterSneakerMintingProps = {
  mintingState: StarterSneakerMintingState
  /** A pass holder's free Sneaker is their Founder Sneaker (D-041). */
  starterSneakerKind: StarterSneakerKind
  /** The mint waits in the queue while `SneakerGame` is paused (D-032). */
  isGamePaused: boolean
  onRetryPress: () => void
  isRetrying: boolean
}

const NOT_STARTED_STEP: OnboardingStep = { status: 'notStarted', transactionHash: null }
const WAITING_STEP: OnboardingStep = { status: 'pending', transactionHash: null }
const ONBOARDING_STEP_COUNT = 2

/** The words that differ between a normal starter and a founder's Founder Sneaker. */
const SNEAKER_COPY: Record<
  StarterSneakerKind,
  { sneakerName: string; metaLabel: string; stepLabel: string; explanation: string }
> = {
  normal: {
    sneakerName: 'Sneaker',
    metaLabel: 'Starter Sneaker',
    stepLabel: 'Your starter Sneaker',
    explanation:
      'Every new player gets a free Sneaker and a little testnet MON for gas. Both are sent on Monad, which usually takes a few seconds.',
  },
  founder: {
    sneakerName: 'Founder Sneaker',
    metaLabel: 'Founder Sneaker',
    stepLabel: 'Your Founder Sneaker',
    explanation:
      'Your Founding Pass comes with a Founder Sneaker, drawn in your pass’s design, and a little testnet MON for gas. It’s free, and it can’t be sent or sold. Both are sent on Monad, which usually takes a few seconds.',
  },
}

/**
 * The "Minting your Sneaker…" screen, black like Lusion's preloader: both onboarding
 * transactions as steps (pending, done with an explorer link, or failed), a way forward
 * on failure, and a big percent of the steps confirmed. A founder sees it as "Minting your
 * Founder Sneaker…" (D-046).
 */
export function StarterSneakerMinting({
  mintingState,
  starterSneakerKind,
  isGamePaused,
  onRetryPress,
  isRetrying,
}: StarterSneakerMintingProps) {
  const sneakerCopy = SNEAKER_COPY[starterSneakerKind]
  const { starterSneakerStep, gasDripStep } = readSteps(mintingState)
  const confirmedStepCount = [starterSneakerStep, gasDripStep].filter(
    (step) => step.status === 'confirmed',
  ).length
  const progressPercent = Math.round((confirmedStepCount / ONBOARDING_STEP_COUNT) * 100)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MetaLabel items={[sneakerCopy.metaLabel, 'Monad testnet']} tone="dark" />
        <Text style={styles.title} accessibilityRole="header">
          {describeTitle(mintingState, sneakerCopy.sneakerName)}
        </Text>
        <Text style={styles.explanation}>{sneakerCopy.explanation}</Text>
      </View>

      <View style={styles.steps}>
        <OnboardingStepRow
          label={sneakerCopy.stepLabel}
          step={starterSneakerStep}
          statusText={{ pending: 'Minting on Monad…', confirmed: 'Minted', failed: 'Not minted' }}
        />
        <OnboardingStepRow
          label="MON for gas"
          step={gasDripStep}
          statusText={{ pending: 'Sending…', confirmed: 'In your wallet', failed: 'Not sent' }}
        />
      </View>

      <MintingFeedback
        mintingState={mintingState}
        starterSneakerKind={starterSneakerKind}
        isGamePaused={isGamePaused}
        onRetryPress={onRetryPress}
        isRetrying={isRetrying}
      />

      <CounterText
        value={`${progressPercent}%`}
        tone="dark"
        accessibilityLabel={`${confirmedStepCount} of ${ONBOARDING_STEP_COUNT} steps done`}
      />
    </View>
  )
}

function MintingFeedback({
  mintingState,
  starterSneakerKind,
  isGamePaused,
  onRetryPress,
  isRetrying,
}: StarterSneakerMintingProps) {
  const { sneakerName } = SNEAKER_COPY[starterSneakerKind]
  // A founder's way to help, as everywhere the pass shows (Part 7 replaces it with `/help`).
  const helpLink =
    starterSneakerKind === 'founder' ? (
      <ExternalLink label="Help with the Founding Pass" url={foundingPassHelpUrl} tone="onDark" />
    ) : null
  switch (mintingState.phase) {
    case 'requesting':
      return null
    case 'minting':
      return isGamePaused ? (
        <Text style={styles.progress} accessibilityRole="alert">
          StrideMon is paused for maintenance. Your {sneakerName} is saved in the queue and mints by
          itself when the game is back.
        </Text>
      ) : null
    case 'arriving':
      return <Text style={styles.progress}>Loading your {sneakerName} from Monad…</Text>
    case 'requestFailed':
      return (
        <View style={styles.feedback}>
          <ErrorState
            message={describeStarterSneakerRequestError(mintingState.errorCode)}
            onRetryPress={onRetryPress}
            isRetrying={isRetrying}
            tone="dark"
          />
          {helpLink}
        </View>
      )
    case 'mintFailed':
      return (
        <View style={styles.feedback}>
          <ErrorState
            message={`Minting your ${sneakerName} didn’t go through, and nothing was charged to you. Check again in a few minutes.`}
            onRetryPress={onRetryPress}
            isRetrying={isRetrying}
            retryLabel="Check again"
            tone="dark"
          />
          {helpLink}
        </View>
      )
    default: {
      const unhandledPhase: never = mintingState
      throw new Error(`Unhandled minting phase: ${JSON.stringify(unhandledPhase)}`)
    }
  }
}

function readSteps(mintingState: StarterSneakerMintingState): {
  starterSneakerStep: OnboardingStep
  gasDripStep: OnboardingStep
} {
  switch (mintingState.phase) {
    case 'requesting':
      return { starterSneakerStep: WAITING_STEP, gasDripStep: WAITING_STEP }
    case 'requestFailed':
      return { starterSneakerStep: NOT_STARTED_STEP, gasDripStep: NOT_STARTED_STEP }
    default:
      return {
        starterSneakerStep: mintingState.onboardingStatus.starterSneaker,
        gasDripStep: mintingState.onboardingStatus.gasDrip,
      }
  }
}

function describeTitle(mintingState: StarterSneakerMintingState, sneakerName: string): string {
  switch (mintingState.phase) {
    case 'requesting':
    case 'minting':
      return `Minting your ${sneakerName}…`
    case 'arriving':
      return `Your ${sneakerName} is here`
    case 'requestFailed':
      return `We couldn’t request your ${sneakerName}`
    case 'mintFailed':
      return `We couldn’t mint your ${sneakerName}`
    default: {
      const unhandledPhase: never = mintingState
      throw new Error(`Unhandled minting phase: ${JSON.stringify(unhandledPhase)}`)
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
    gap: spacing.extraLarge,
  },
  header: {
    gap: spacing.medium,
  },
  title: {
    ...textStyles.heading,
    color: colors.textOnDark,
  },
  explanation: {
    ...textStyles.body,
    color: colors.textOnDarkMuted,
  },
  steps: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.overlayOnDark,
  },
  progress: {
    ...textStyles.body,
    color: colors.textOnDark,
  },
  feedback: {
    gap: spacing.small,
  },
})
