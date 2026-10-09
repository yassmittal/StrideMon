import type { StarterSneakerKind } from '@stridemon/shared/domain'
import { router } from 'expo-router'
import type { ReactNode } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { ErrorState } from '../../src/components/ui/ErrorState'
import { ExternalLink } from '../../src/components/ui/ExternalLink'
import { HeroPanel } from '../../src/components/ui/HeroPanel'
import { LoadingScreen } from '../../src/components/ui/LoadingScreen'
import { MetaLabel } from '../../src/components/ui/MetaLabel'
import { Panel } from '../../src/components/ui/Panel'
import { Screen } from '../../src/components/ui/Screen'
import { buildHelpUrl } from '../../src/config/website-urls'
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
import { useSignOut } from '../../src/features/auth/hooks/useSignOut'
import { FoundingPassGate } from '../../src/features/founding-pass/components/FoundingPassGate'
import { useFoundingPass } from '../../src/features/founding-pass/hooks/useFoundingPass'
import { useFoundingPassGate } from '../../src/features/founding-pass/hooks/useFoundingPassGate'
import { StarterSneakerMinting } from '../../src/features/onboarding/components/StarterSneakerMinting'
import { useStarterSneakerOnboarding } from '../../src/features/onboarding/hooks/useStarterSneakerOnboarding'
import { RewardBalanceCard } from '../../src/features/rewards/components/RewardBalanceCard'
import { useRewardBalance } from '../../src/features/rewards/hooks/useRewardBalance'
import { MaintenanceNotice } from '../../src/features/sneaker/components/MaintenanceNotice'
import { NoSneakersCard } from '../../src/features/sneaker/components/NoSneakersCard'
import { SneakerCard } from '../../src/features/sneaker/components/SneakerCard'
import { SneakerPicker } from '../../src/features/sneaker/components/SneakerPicker'
import { useGameConfig } from '../../src/features/sneaker/hooks/useGameConfig'
import { useIsGamePaused } from '../../src/features/sneaker/hooks/useIsGamePaused'
import { useSelectedSneaker } from '../../src/features/sneaker/hooks/useSelectedSneaker'
import { useSneakerAttributes } from '../../src/features/sneaker/hooks/useSneakerAttributes'
import {
  type SneakerEnergy,
  useSneakerEnergy,
} from '../../src/features/sneaker/hooks/useSneakerEnergy'
import { useSneakerImageSvg } from '../../src/features/sneaker/hooks/useSneakerImageSvg'
import { buildSneakerExplorerUrl } from '../../src/lib/chain/explorer-urls'
import { colors, fontFamilies, spacing, textStyles } from '../../src/theme'

/**
 * Home: the selected Sneaker (with a picker when the wallet owns several), the starter
 * mint while the player has never had one, or an empty state once they've sent it away.
 * A Founding Pass comes first: its holder gets their Founder Sneaker before anything else (D-046).
 */
export default function HomeScreen() {
  const currentUserQuery = useCurrentUser()
  const walletAddress = currentUserQuery.data?.user.walletAddress
  const {
    selectedSneaker,
    pickSneaker,
    refetch: refetchSelectedSneaker,
  } = useSelectedSneaker(walletAddress)
  const { foundingPassState, refetch: refetchFoundingPass } = useFoundingPass(walletAddress)

  if (currentUserQuery.isError) {
    return (
      <Screen>
        <ErrorState
          message="Couldn’t load your account. Check your connection and try again."
          onRetryPress={() => currentUserQuery.refetch()}
          isRetrying={currentUserQuery.isRefetching}
        />
        <ExternalLink label="Get help" url={buildHelpUrl('cant-reach-stridemon')} />
      </Screen>
    )
  }

  if (foundingPassState.status === 'error') {
    return (
      <Screen>
        <ErrorState
          message="Couldn’t read your Founding Pass from Monad. Check your connection and try again."
          onRetryPress={() => void refetchFoundingPass()}
        />
        <ExternalLink label="Get help" url={buildHelpUrl('app-cant-read-monad')} />
      </Screen>
    )
  }
  if (
    foundingPassState.status === 'held' &&
    foundingPassState.foundingPass.founderSneakerTokenId === null
  ) {
    // Keyed apart from the normal starter's screen, so moving between them asks the API afresh.
    return <FreeSneakerOnboarding key="founder" starterSneakerKind="founder" />
  }

  switch (selectedSneaker.status) {
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
            onRetryPress={refetchSelectedSneaker}
          />
          <ExternalLink label="Get help" url={buildHelpUrl('app-cant-read-monad')} />
        </Screen>
      )
    case 'none':
      // The pass decides between the Founder Sneaker and the normal starter, so wait for it.
      if (foundingPassState.status === 'loading') {
        return (
          <LoadingScreen
            accessibilityLabel="Reading your Sneaker from Monad"
            message="Reading your Sneaker from Monad…"
          />
        )
      }
      if (!selectedSneaker.hasClaimedStarterSneaker) {
        return <FreeSneakerOnboarding key="starter" starterSneakerKind="normal" />
      }
      return (
        <Screen isScrollable>
          <HomeHeader />
          {walletAddress !== undefined && <NoSneakersCard walletAddress={walletAddress} />}
        </Screen>
      )
    case 'owned':
      return (
        <SneakerHome
          walletAddress={walletAddress}
          sneakerTokenId={selectedSneaker.selectedSneakerTokenId}
          sneakerPicker={
            <SneakerPicker
              sneakerTokenIds={selectedSneaker.sneakerTokenIds}
              selectedSneakerTokenId={selectedSneaker.selectedSneakerTokenId}
              onSneakerPress={pickSneaker}
            />
          }
        />
      )
    default: {
      const unhandledSelectedSneaker: never = selectedSneaker
      throw new Error(`Unhandled Sneaker state: ${String(unhandledSelectedSneaker)}`)
    }
  }
}

/** The wordmark, as on Lusion's header. */
function HomeHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.wordmark} accessibilityRole="header">
        StrideMon
      </Text>
      <MetaLabel items={['Monad testnet']} />
    </View>
  )
}

/**
 * Shown until the chain says the wallet owns its free Sneaker; Home then switches by itself.
 * While early access is on, the API refuses a wallet without a pass, and the gate shows instead.
 */
function FreeSneakerOnboarding({ starterSneakerKind }: { starterSneakerKind: StarterSneakerKind }) {
  const { mintingState, retry, isRetrying } = useStarterSneakerOnboarding()
  const isGamePaused = useIsGamePaused()
  if (
    mintingState.phase === 'requestFailed' &&
    mintingState.errorCode === 'FOUNDING_PASS_REQUIRED'
  ) {
    return <FoundingPassGateScreen requestStarterSneakerAgain={retry} />
  }
  return (
    <Screen tone="dark">
      <StarterSneakerMinting
        mintingState={mintingState}
        starterSneakerKind={starterSneakerKind}
        isGamePaused={isGamePaused}
        onRetryPress={retry}
        isRetrying={isRetrying}
      />
    </Screen>
  )
}

/** "Mint a Founding Pass to get in early" (D-046). Home leaves it once the chain shows a pass. */
function FoundingPassGateScreen({
  requestStarterSneakerAgain,
}: {
  requestStarterSneakerAgain: () => void
}) {
  const currentUserQuery = useCurrentUser()
  const walletAddress = currentUserQuery.data?.user.walletAddress
  if (walletAddress === undefined) {
    return <LoadingScreen accessibilityLabel="Loading your account" />
  }
  return (
    <FoundingPassGateContent
      walletAddress={walletAddress}
      requestStarterSneakerAgain={requestStarterSneakerAgain}
    />
  )
}

function FoundingPassGateContent({
  walletAddress,
  requestStarterSneakerAgain,
}: {
  walletAddress: string
  requestStarterSneakerAgain: () => void
}) {
  const { scheduleQuery, passCheck, checkForPass } = useFoundingPassGate({
    walletAddress,
    requestStarterSneakerAgain,
  })
  const { signOut, isSigningOut } = useSignOut()
  return (
    <Screen isScrollable>
      <HomeHeader />
      <FoundingPassGate
        walletAddress={walletAddress}
        collection={scheduleQuery.data}
        isCollectionUnavailable={scheduleQuery.isError}
        passCheck={passCheck}
        onCheckForPassPress={() => void checkForPass()}
        onSignOutPress={signOut}
        isSigningOut={isSigningOut}
      />
    </Screen>
  )
}

type SneakerHomeProps = {
  walletAddress: string | undefined
  sneakerTokenId: bigint
  sneakerPicker: ReactNode
}

function SneakerHome({ walletAddress, sneakerTokenId, sneakerPicker }: SneakerHomeProps) {
  const attributesQuery = useSneakerAttributes(sneakerTokenId)
  const imageSvgQuery = useSneakerImageSvg(sneakerTokenId)
  const gameConfigQuery = useGameConfig()
  const sneakerEnergy = useSneakerEnergy({
    sneakerTokenId,
    energyAnchor: attributesQuery.data,
    gameConfig: gameConfigQuery.data,
  })
  const rewardBalanceQuery = useRewardBalance(walletAddress)
  const isGamePaused = useIsGamePaused()

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
      <HomeHeader />

      {sneakerPicker}

      {isGamePaused && <MaintenanceNotice />}

      {isSneakerError ? (
        <Panel>
          <ErrorState
            message="Couldn’t read your Sneaker’s stats from Monad."
            onRetryPress={handleSneakerRetryPress}
          />
        </Panel>
      ) : attributes === undefined || gameConfig === undefined || energy === undefined ? (
        <HeroPanel>
          <ActivityIndicator color={colors.textOnDark} accessibilityLabel="Loading your Sneaker" />
        </HeroPanel>
      ) : (
        <SneakerCard
          sneakerTokenId={sneakerTokenId}
          imageSvg={imageSvgQuery.data}
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
        isGamePaused={isGamePaused}
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
  isGamePaused: boolean
  /** `undefined` while the Sneaker's stats load: START waits for them. */
  sneakerStats: { efficiency: number; durability: number; energy: SneakerEnergy } | undefined
}

/** START, or Resume / Finish when a run is still in progress on this phone. */
function RunSection({ sneakerTokenId, isGamePaused, sneakerStats }: RunSectionProps) {
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
    return <ActivityIndicator color={colors.textPrimary} accessibilityLabel="Checking for a run" />
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
    isGamePaused,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.small,
  },
  wordmark: {
    ...textStyles.title,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
  },
})
