import { ActivityIndicator, StyleSheet, Text } from 'react-native'
import { Card } from '../../src/components/ui/Card'
import { ErrorState } from '../../src/components/ui/ErrorState'
import { LoadingScreen } from '../../src/components/ui/LoadingScreen'
import { Screen } from '../../src/components/ui/Screen'
import { useCurrentUser } from '../../src/features/auth/hooks/useCurrentUser'
import { useRewardBalance } from '../../src/features/rewards/hooks/useRewardBalance'
import { RepairPanel } from '../../src/features/sneaker/components/RepairPanel'
import { SneakerCard } from '../../src/features/sneaker/components/SneakerCard'
import { UpgradePanel } from '../../src/features/sneaker/components/UpgradePanel'
import { useGameConfig } from '../../src/features/sneaker/hooks/useGameConfig'
import { useOwnedSneaker } from '../../src/features/sneaker/hooks/useOwnedSneaker'
import { useRepairSneaker } from '../../src/features/sneaker/hooks/useRepairSneaker'
import { useSneakerAttributes } from '../../src/features/sneaker/hooks/useSneakerAttributes'
import { useSneakerEnergy } from '../../src/features/sneaker/hooks/useSneakerEnergy'
import { useUpgradeSneaker } from '../../src/features/sneaker/hooks/useUpgradeSneaker'
import { buildSneakerExplorerUrl } from '../../src/lib/chain/explorer-urls'
import { colors, fontSizes, fontWeights } from '../../src/theme'

/** Sneaker detail: stats, then spending SOLE to repair and upgrade it. */
export default function SneakerScreen() {
  const currentUserQuery = useCurrentUser()
  const walletAddress = currentUserQuery.data?.user.walletAddress
  const { ownedSneaker, refetch: refetchOwnedSneaker } = useOwnedSneaker(walletAddress)

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
      return (
        <Screen>
          <Text style={styles.title}>Sneaker</Text>
          <Text style={styles.caption}>Your starter Sneaker is on its way. Check Home.</Text>
        </Screen>
      )
    case 'owned':
      return (
        <SneakerDetail walletAddress={walletAddress} sneakerTokenId={ownedSneaker.sneakerTokenId} />
      )
    default: {
      const unhandledOwnedSneaker: never = ownedSneaker
      throw new Error(`Unhandled Sneaker state: ${JSON.stringify(unhandledOwnedSneaker)}`)
    }
  }
}

type SneakerDetailProps = {
  walletAddress: string | undefined
  sneakerTokenId: bigint
}

function SneakerDetail({ walletAddress, sneakerTokenId }: SneakerDetailProps) {
  const attributesQuery = useSneakerAttributes(sneakerTokenId)
  const gameConfigQuery = useGameConfig()
  const sneakerEnergy = useSneakerEnergy({
    sneakerTokenId,
    energyAnchor: attributesQuery.data,
    gameConfig: gameConfigQuery.data,
  })
  const rewardBalanceQuery = useRewardBalance(walletAddress)
  const repair = useRepairSneaker(sneakerTokenId)
  const upgrade = useUpgradeSneaker(sneakerTokenId)

  const attributes = attributesQuery.data
  const gameConfig = gameConfigQuery.data
  const rewardBalanceWei = rewardBalanceQuery.data
  const { energy } = sneakerEnergy

  function handleRetryPress() {
    void attributesQuery.refetch()
    void gameConfigQuery.refetch()
    void sneakerEnergy.refetch()
    void rewardBalanceQuery.refetch()
  }

  const isError =
    attributesQuery.isError ||
    gameConfigQuery.isError ||
    sneakerEnergy.isError ||
    rewardBalanceQuery.isError

  return (
    <Screen isScrollable>
      <Text style={styles.title} accessibilityRole="header">
        Sneaker
      </Text>

      {isError ? (
        <Card>
          <ErrorState
            message="Couldn’t read your Sneaker from Monad."
            onRetryPress={handleRetryPress}
          />
        </Card>
      ) : attributes === undefined ||
        gameConfig === undefined ||
        energy === undefined ||
        rewardBalanceWei === undefined ? (
        <Card>
          <ActivityIndicator color={colors.primary} accessibilityLabel="Loading your Sneaker" />
        </Card>
      ) : (
        <>
          <SneakerCard
            sneakerTokenId={sneakerTokenId}
            level={attributes.level}
            efficiency={attributes.efficiency}
            durability={attributes.durability}
            maxDurability={gameConfig.maxDurability}
            energy={energy}
            explorerUrl={buildSneakerExplorerUrl(sneakerTokenId)}
          />
          <RepairPanel
            durability={attributes.durability}
            maxDurability={gameConfig.maxDurability}
            repairCost={repair.repairCost}
            rewardBalanceWei={rewardBalanceWei}
            transactionState={repair.transactionState}
            onConfirmPress={repair.submitRepair}
            onTransactionReset={repair.resetRepair}
          />
          <UpgradePanel
            level={attributes.level}
            maxLevel={gameConfig.maxLevel}
            efficiency={attributes.efficiency}
            efficiencyGainPerLevel={gameConfig.efficiencyGainPerLevel}
            upgradeCost={upgrade.upgradeCost}
            rewardBalanceWei={rewardBalanceWei}
            transactionState={upgrade.transactionState}
            onConfirmPress={upgrade.submitUpgrade}
            onTransactionReset={upgrade.resetUpgrade}
          />
        </>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  caption: {
    fontSize: fontSizes.body,
    color: colors.textSecondary,
  },
})
