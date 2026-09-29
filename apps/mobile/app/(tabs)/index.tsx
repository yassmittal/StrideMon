import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { Button } from '../../src/components/ui/Button'
import { Card } from '../../src/components/ui/Card'
import { ErrorState } from '../../src/components/ui/ErrorState'
import { LoadingScreen } from '../../src/components/ui/LoadingScreen'
import { Screen } from '../../src/components/ui/Screen'
import { useCurrentUser } from '../../src/features/auth/hooks/useCurrentUser'
import { StarterSneakerMinting } from '../../src/features/onboarding/components/StarterSneakerMinting'
import { useStarterSneakerOnboarding } from '../../src/features/onboarding/hooks/useStarterSneakerOnboarding'
import { RewardBalanceCard } from '../../src/features/rewards/components/RewardBalanceCard'
import { useRewardBalance } from '../../src/features/rewards/hooks/useRewardBalance'
import { SneakerCard } from '../../src/features/sneaker/components/SneakerCard'
import { useGameConfig } from '../../src/features/sneaker/hooks/useGameConfig'
import { useOwnedSneaker } from '../../src/features/sneaker/hooks/useOwnedSneaker'
import { useSneakerAttributes } from '../../src/features/sneaker/hooks/useSneakerAttributes'
import { useSneakerEnergy } from '../../src/features/sneaker/hooks/useSneakerEnergy'
import { buildSneakerExplorerUrl } from '../../src/lib/chain/explorer-urls'
import { colors, fontSizes, fontWeights, spacing } from '../../src/theme'

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

      <View style={styles.startSection}>
        {/* TODO(phase-4): start an activity session. */}
        <Button label="Start a run" onPress={() => {}} isDisabled />
        <Text style={styles.caption}>Tracking walks and runs arrives in the next update.</Text>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  startSection: {
    gap: spacing.small,
  },
  caption: {
    fontSize: fontSizes.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
})
