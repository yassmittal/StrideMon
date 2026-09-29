import type { OnboardingStep } from '@stridemon/shared/api-contracts'
import { StyleSheet, Text, View } from 'react-native'
import { Card } from '../../../components/ui/Card'
import { ErrorState } from '../../../components/ui/ErrorState'
import { colors, fontSizes, fontWeights, spacing } from '../../../theme'
import {
  describeStarterSneakerRequestError,
  type StarterSneakerMintingState,
} from '../starter-sneaker-minting-state'
import { OnboardingStepRow } from './OnboardingStepRow'

type StarterSneakerMintingProps = {
  mintingState: StarterSneakerMintingState
  onRetryPress: () => void
  isRetrying: boolean
}

const NOT_STARTED_STEP: OnboardingStep = { status: 'notStarted', transactionHash: null }
const WAITING_STEP: OnboardingStep = { status: 'pending', transactionHash: null }

/**
 * The "Minting your Sneaker…" screen: both onboarding transactions as steps, each
 * pending, done (with an explorer link) or failed, and a way forward on failure.
 */
export function StarterSneakerMinting({
  mintingState,
  onRetryPress,
  isRetrying,
}: StarterSneakerMintingProps) {
  const { starterSneakerStep, gasDripStep } = readSteps(mintingState)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          {describeTitle(mintingState)}
        </Text>
        <Text style={styles.explanation}>
          Every new player gets a free Sneaker and a little testnet MON for gas. Both are sent on
          Monad, which usually takes a few seconds.
        </Text>
      </View>

      <Card>
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
      </Card>

      <MintingFeedback
        mintingState={mintingState}
        onRetryPress={onRetryPress}
        isRetrying={isRetrying}
      />
    </View>
  )
}

function MintingFeedback({ mintingState, onRetryPress, isRetrying }: StarterSneakerMintingProps) {
  switch (mintingState.phase) {
    case 'requesting':
    case 'minting':
      return null
    case 'arriving':
      return <Text style={styles.progress}>Loading your Sneaker from Monad…</Text>
    case 'requestFailed':
      return (
        <ErrorState
          message={describeStarterSneakerRequestError(mintingState.errorCode)}
          onRetryPress={onRetryPress}
          isRetrying={isRetrying}
        />
      )
    case 'mintFailed':
      return (
        <ErrorState
          message="Minting your Sneaker didn’t go through, and nothing was charged to you. The game may be paused for maintenance. Check again in a few minutes."
          onRetryPress={onRetryPress}
          isRetrying={isRetrying}
          retryLabel="Check again"
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
    gap: spacing.large,
  },
  header: {
    gap: spacing.small,
  },
  title: {
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  explanation: {
    fontSize: fontSizes.body,
    color: colors.textSecondary,
  },
  progress: {
    fontSize: fontSizes.body,
    color: colors.textPrimary,
  },
})
