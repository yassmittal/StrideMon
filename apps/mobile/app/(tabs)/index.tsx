import { router } from 'expo-router'
import { ActivityIndicator, StyleSheet, Text } from 'react-native'
import { Card } from '../../src/components/ui/Card'
import { ErrorState } from '../../src/components/ui/ErrorState'
import { LoadingScreen } from '../../src/components/ui/LoadingScreen'
import { Screen } from '../../src/components/ui/Screen'
import { ActiveRunBanner } from '../../src/features/activity-session/components/ActiveRunBanner'
import { StartRunPanel } from '../../src/features/activity-session/components/StartRunPanel'
import { useFinishActivitySession } from '../../src/features/activity-session/hooks/useFinishActivitySession'
import { useLocalActiveActivitySession } from '../../src/features/activity-session/hooks/useLocalActiveActivitySession'
import { useStartRunFlow } from '../../src/features/activity-session/hooks/useStartRunFlow'
import { describeRunError } from '../../src/features/activity-session/run-error-messages'
import {
  describeStartRunBlockedReason,
  findStartRunBlockedReason,
} from '../../src/features/activity-session/start-run-availability'
import { useCurrentUser } from '../../src/features/auth/hooks/useCurrentUser'
import { StarterSneakerMinting } from '../../src/features/onboarding/components/StarterSneakerMinting'
import { useStarterSneakerOnboarding } from '../../src/features/onboarding/hooks/useStarterSneakerOnboarding'
import { RewardBalanceCard } from '../../src/features/rewards/components/RewardBalanceCard'
import { useRewardBalance } from '../../src/features/rewards/hooks/useRewardBalance'
import { SneakerCard } from '../../src/features/sneaker/components/SneakerCard'
import { useGameConfig } from '../../src/features/sneaker/hooks/useGameConfig'
import { useOwnedSneaker } from '../../src/features/sneaker/hooks/useOwnedSneaker'
import { useSneakerAttributes } from '../../src/features/sneaker/hooks/useSneakerAttributes'
import {
  type SneakerEnergy,
  useSneakerEnergy,
} from '../../src/features/sneaker/hooks/useSneakerEnergy'
import { buildSneakerExplorerUrl } from '../../src/lib/chain/explorer-urls'
import { colors, fontSizes, fontWeights } from '../../src/theme'

/** Home: the player's Sneaker, or the starter mint while they don't have one yet. */
export default function HomeScreen() {
  const currentUserQuery = useCurrentUser()
  const walletAddress = currentUserQuery.data?.user.walletAddress
  const { ownedSneaker, refetch: refetchOwnedSneaker } = useOwnedSneaker(walletAddress)

  if (currentUserQuery.isError) {
    return (
      <Screen>
        <ErrorState
          message="Couldn’t load your account. Check your connection and try again."
          onRetryPress={() => currentUserQuery.refetch()}
          isRetrying={currentUserQuery.isRefetching}
        />
      </Screen>
    )
  }

  switch (ownedSneaker.status) {
    case 'loading':
      return (
        <LoadingScreen
          accessibilityLabel="Reading your Sneaker from Monad"
          message="Reading your Sneaker from Monad…"
        />
      )
    case 'error':
      return (
        <Screen>
          <ErrorState
            message="Couldn’t read your Sneaker from Monad. Check your connection and try again."
            onRetryPress={refetchOwnedSneaker}
          />
        </Screen>
      )
    case 'none':
      return <StarterSneakerOnboarding />
    case 'owned':
      return (
        <SneakerHome walletAddress={walletAddress} sneakerTokenId={ownedSneaker.sneakerTokenId} />
      )
    default: {
      const unhandledOwnedSneaker: never = ownedSneaker
      throw new Error(`Unhandled Sneaker state: ${JSON.stringify(unhandledOwnedSneaker)}`)
    }
  }
}

/** Shown until the chain says the wallet owns a Sneaker; Home then switches by itself. */
function StarterSneakerOnboarding() {
  const { mintingState, retry, isRetrying } = useStarterSneakerOnboarding()
  return (
    <Screen isScrollable>
      <StarterSneakerMinting
        mintingState={mintingState}
        onRetryPress={retry}
        isRetrying={isRetrying}
      />
    </Screen>
  )
}

type SneakerHomeProps = {
  walletAddress: string | undefined
  sneakerTokenId: bigint
}

function SneakerHome({ walletAddress, sneakerTokenId }: SneakerHomeProps) {
  const attributesQuery = useSneakerAttributes(sneakerTokenId)
  const gameConfigQuery = useGameConfig()
  const sneakerEnergy = useSneakerEnergy({
    sneakerTokenId,
    energyAnchor: attributesQuery.data,
    gameConfig: gameConfigQuery.data,
  })
  const rewardBalanceQuery = useRewardBalance(walletAddress)

  const attributes = attributesQuery.data
  const gameConfig = gameConfigQuery.data
  const { energy } = sneakerEnergy
  const isSneakerError = attributesQuery.isError || gameConfigQuery.isError || sneakerEnergy.isError

  function handleSneakerRetryPress() {
    void attributesQuery.refetch()
    void gameConfigQuery.refetch()
    void sneakerEnergy.refetch()
  }

  return (
    <Screen isScrollable>
      <Text style={styles.title} accessibilityRole="header">
        StrideMon
      </Text>

      {isSneakerError ? (
        <Card>
          <ErrorState
            message="Couldn’t read your Sneaker’s stats from Monad."
            onRetryPress={handleSneakerRetryPress}
          />
        </Card>
      ) : attributes === undefined || gameConfig === undefined || energy === undefined ? (
        <Card>
          <ActivityIndicator color={colors.primary} accessibilityLabel="Loading your Sneaker" />
        </Card>
      ) : (
        <SneakerCard
          sneakerTokenId={sneakerTokenId}
          level={attributes.level}
          efficiency={attributes.efficiency}
          durability={attributes.durability}
          maxDurability={gameConfig.maxDurability}
          energy={energy}
          explorerUrl={buildSneakerExplorerUrl(sneakerTokenId)}
        />
      )}

      <RewardBalanceCard
        rewardBalanceWei={rewardBalanceQuery.data}
        isLoading={rewardBalanceQuery.isLoading}
        isError={rewardBalanceQuery.isError}
        onRetryPress={() => rewardBalanceQuery.refetch()}
      />

      <RunSection
        sneakerTokenId={sneakerTokenId}
        sneakerStats={
          attributes === undefined || energy === undefined
            ? undefined
            : { efficiency: attributes.efficiency, durability: attributes.durability, energy }
        }
      />
    </Screen>
  )
}

type RunSectionProps = {
  sneakerTokenId: bigint
  /** `undefined` while the Sneaker's stats load: START waits for them. */
  sneakerStats: { efficiency: number; durability: number; energy: SneakerEnergy } | undefined
}

/** START, or Resume / Finish when a run is still in progress on this phone. */
function RunSection({ sneakerTokenId, sneakerStats }: RunSectionProps) {
  const localActiveActivitySessionQuery = useLocalActiveActivitySession()
  const { startRun, isStarting, errorMessage: startErrorMessage } = useStartRunFlow()
  const finishMutation = useFinishActivitySession()

  if (localActiveActivitySessionQuery.isError) {
    return (
      <ErrorState
        message="Couldn’t check for a run in progress."
        onRetryPress={() => localActiveActivitySessionQuery.refetch()}
        isRetrying={localActiveActivitySessionQuery.isRefetching}
      />
    )
  }
  const localActiveActivitySession = localActiveActivitySessionQuery.data
  if (localActiveActivitySession === undefined || sneakerStats === undefined) {
    return <ActivityIndicator color={colors.primary} accessibilityLabel="Checking for a run" />
  }

  if (localActiveActivitySession !== null) {
    return (
      <ActiveRunBanner
        onResumePress={() => router.push('/run/active')}
        onFinishPress={() =>
          finishMutation.mutate(localActiveActivitySession.activitySessionId, {
            onSuccess: (activitySession) =>
              router.push(`/run/summary/${activitySession.activitySessionId}`),
          })
        }
        isFinishing={finishMutation.isPending}
        errorMessage={finishMutation.error === null ? null : describeRunError(finishMutation.error)}
      />
    )
  }

  const blockedReason = findStartRunBlockedReason({
    currentEnergy: sneakerStats.energy.currentEnergy,
    durability: sneakerStats.durability,
  })
  return (
    <StartRunPanel
      onStartPress={() => startRun({ sneakerTokenId, efficiency: sneakerStats.efficiency })}
      blockedReasonMessage={
        blockedReason === null
          ? null
          : describeStartRunBlockedReason({
              blockedReason,
              secondsUntilNextEnergyPoint: sneakerStats.energy.secondsUntilNextEnergyPoint,
            })
      }
      isStarting={isStarting}
      errorMessage={startErrorMessage}
    />
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
})
