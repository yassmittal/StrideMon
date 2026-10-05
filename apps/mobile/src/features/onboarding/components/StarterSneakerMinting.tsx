import type { OnboardingStep } from '@stridemon/shared/api-contracts'
import { StyleSheet, Text, View } from 'react-native'
import { CounterText } from '../../../components/ui/CounterText'
import { ErrorState } from '../../../components/ui/ErrorState'
import { MetaLabel } from '../../../components/ui/MetaLabel'
import { colors, spacing, textStyles } from '../../../theme'
import {
  describeStarterSneakerRequestError,
  type StarterSneakerMintingState,
} from '../starter-sneaker-minting-state'
import { OnboardingStepRow } from './OnboardingStepRow'

type StarterSneakerMintingProps = {
  mintingState: StarterSneakerMintingState
  /** The mint waits in the queue while `SneakerGame` is paused (D-032). */
  isGamePaused: boolean
  onRetryPress: () => void
  isRetrying: boolean
}

const NOT_STARTED_STEP: OnboardingStep = { status: 'notStarted', transactionHash: null }
const WAITING_STEP: OnboardingStep = { status: 'pending', transactionHash: null }
const ONBOARDING_STEP_COUNT = 2

/**
 * The "Minting your Sneaker…" screen, black like Lusion's preloader: both onboarding
 * transactions as steps (pending, done with an explorer link, or failed), a way forward
 * on failure, and a big percent of the steps confirmed.
 */
export function StarterSneakerMinting({
  mintingState,
  isGamePaused,
  onRetryPress,
  isRetrying,
}: StarterSneakerMintingProps) {
  const { starterSneakerStep, gasDripStep } = readSteps(mintingState)
  const confirmedStepCount = [starterSneakerStep, gasDripStep].filter(
    (step) => step.status === 'confirmed',
  ).length
  const progressPercent = Math.round((confirmedStepCount / ONBOARDING_STEP_COUNT) * 100)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MetaLabel items={['Starter Sneaker', 'Monad testnet']} tone="dark" />
        <Text style={styles.title} accessibilityRole="header">
          {describeTitle(mintingState)}
        </Text>
        <Text style={styles.explanation}>
          Every new player gets a free Sneaker and a little testnet MON for gas. Both are sent on
          Monad, which usually takes a few seconds.
        </Text>
      </View>

      <View style={styles.steps}>
        <OnboardingStepRow
          label="Your starter Sneaker"
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
  isGamePaused,
  onRetryPress,
  isRetrying,
}: StarterSneakerMintingProps) {
  switch (mintingState.phase) {
    case 'requesting':
      return null
    case 'minting':
      return isGamePaused ? (
        <Text style={styles.progress} accessibilityRole="alert">
          StrideMon is paused for maintenance. Your Sneaker is saved in the queue and mints by
          itself when the game is back.
        </Text>
      ) : null
    case 'arriving':
      return <Text style={styles.progress}>Loading your Sneaker from Monad…</Text>
    case 'requestFailed':
      return (
        <ErrorState
          message={describeStarterSneakerRequestError(mintingState.errorCode)}
          onRetryPress={onRetryPress}
          isRetrying={isRetrying}
          tone="dark"
        />
      )
    case 'mintFailed':
      return (
        <ErrorState
          message="Minting your Sneaker didn’t go through, and nothing was charged to you. Check again in a few minutes."
          onRetryPress={onRetryPress}
          isRetrying={isRetrying}
          retryLabel="Check again"
          tone="dark"
        />
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

function describeTitle(mintingState: StarterSneakerMintingState): string {
  switch (mintingState.phase) {
    case 'requesting':
    case 'minting':
      return 'Minting your Sneaker…'
    case 'arriving':
      return 'Your Sneaker is here'
    case 'requestFailed':
      return 'We couldn’t request your Sneaker'
    case 'mintFailed':
      return 'We couldn’t mint your Sneaker'
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
})
