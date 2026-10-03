import { router } from 'expo-router'
import type { ReactNode } from 'react'
import { ActivityIndicator, StyleSheet, Text } from 'react-native'
import { ErrorState } from '../../src/components/ui/ErrorState'
import { LoadingScreen } from '../../src/components/ui/LoadingScreen'
import { Panel } from '../../src/components/ui/Panel'
import { Screen } from '../../src/components/ui/Screen'
import { ScreenTitle } from '../../src/components/ui/ScreenTitle'
import { useLocalActiveActivitySession } from '../../src/features/activity-session/hooks/useLocalActiveActivitySession'
import { useCurrentUser } from '../../src/features/auth/hooks/useCurrentUser'
import { useRewardBalance } from '../../src/features/rewards/hooks/useRewardBalance'
import { NoSneakersCard } from '../../src/features/sneaker/components/NoSneakersCard'
import { RepairPanel } from '../../src/features/sneaker/components/RepairPanel'
import { SneakerCard } from '../../src/features/sneaker/components/SneakerCard'
import { SneakerPicker } from '../../src/features/sneaker/components/SneakerPicker'
import { TransferPanel } from '../../src/features/sneaker/components/TransferPanel'
import { UpgradePanel } from '../../src/features/sneaker/components/UpgradePanel'
import { useGameConfig } from '../../src/features/sneaker/hooks/useGameConfig'
import { useRepairSneaker } from '../../src/features/sneaker/hooks/useRepairSneaker'
import { useSelectedSneaker } from '../../src/features/sneaker/hooks/useSelectedSneaker'
import { useSneakerAttributes } from '../../src/features/sneaker/hooks/useSneakerAttributes'
import { useSneakerEnergy } from '../../src/features/sneaker/hooks/useSneakerEnergy'
import { useUpgradeSneaker } from '../../src/features/sneaker/hooks/useUpgradeSneaker'
import { buildSneakerExplorerUrl } from '../../src/lib/chain/explorer-urls'
import { colors, textStyles } from '../../src/theme'

/** Sneaker detail: stats, spending SOLE to repair and upgrade it, and sending it to another wallet. */
export default function SneakerScreen() {
  const currentUserQuery = useCurrentUser()
  const walletAddress = currentUserQuery.data?.user.walletAddress
  const {
    selectedSneaker,
    pickSneaker,
    refetch: refetchSelectedSneaker,
  } = useSelectedSneaker(walletAddress)

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
        </Screen>
      )
    case 'none':
      return (
        <Screen>
          <ScreenTitle title="Sneaker" />
          {selectedSneaker.hasClaimedStarterSneaker && walletAddress !== undefined ? (
            <NoSneakersCard walletAddress={walletAddress} />
          ) : (
            <Text style={styles.caption}>Your starter Sneaker is on its way. Check Home.</Text>
          )}
        </Screen>
      )
    case 'owned':
      return (
        <SneakerDetail
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

type SneakerDetailProps = {
  walletAddress: string | undefined
  sneakerTokenId: bigint
  sneakerPicker: ReactNode
}

function SneakerDetail({ walletAddress, sneakerTokenId, sneakerPicker }: SneakerDetailProps) {
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
  const localActiveActivitySessionQuery = useLocalActiveActivitySession()

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
      <ScreenTitle title="Sneaker" metaItems={['Repair', 'Upgrade', 'Send']} />

      {sneakerPicker}

      {isError ? (
        <Panel>
          <ErrorState
            message="Couldn’t read your Sneaker from Monad."
            onRetryPress={handleRetryPress}
          />
        </Panel>
      ) : attributes === undefined ||
        gameConfig === undefined ||
        energy === undefined ||
        rewardBalanceWei === undefined ? (
        <Panel>
          <ActivityIndicator color={colors.textPrimary} accessibilityLabel="Loading your Sneaker" />
        </Panel>
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
          <TransferPanel
            sneakerTokenId={sneakerTokenId}
            // While the check loads, it counts as no run: settlement rejects a mid-run transfer anyway.
            isRunInProgress={Boolean(localActiveActivitySessionQuery.data)}
            onTransferPress={() =>
              router.push({
                pathname: '/sneaker/transfer',
                params: { sneakerTokenId: sneakerTokenId.toString() },
              })
            }
          />
        </>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  caption: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
})
