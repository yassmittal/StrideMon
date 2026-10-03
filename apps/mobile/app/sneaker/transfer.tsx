import { tokenIdStringSchema } from '@stridemon/shared/api-contracts'
import { router, useLocalSearchParams } from 'expo-router'
import { getAddress } from 'viem'
import { ErrorState } from '../../src/components/ui/ErrorState'
import { LoadingScreen } from '../../src/components/ui/LoadingScreen'
import { Screen } from '../../src/components/ui/Screen'
import { useLocalActiveActivitySession } from '../../src/features/activity-session/hooks/useLocalActiveActivitySession'
import { useCurrentUser } from '../../src/features/auth/hooks/useCurrentUser'
import { TransferSneakerForm } from '../../src/features/sneaker/components/TransferSneakerForm'
import { useGameConfig } from '../../src/features/sneaker/hooks/useGameConfig'
import { useSneakerAttributes } from '../../src/features/sneaker/hooks/useSneakerAttributes'
import { useTransferSneaker } from '../../src/features/sneaker/hooks/useTransferSneaker'

/**
 * Send a Sneaker to another wallet. The Sneaker comes from the route, not the current
 * selection, so the screen keeps showing it after it leaves the wallet.
 */
export default function TransferSneakerScreen() {
  const { sneakerTokenId: sneakerTokenIdParam } = useLocalSearchParams<{ sneakerTokenId: string }>()
  const parsedSneakerTokenId = tokenIdStringSchema.safeParse(sneakerTokenIdParam)
  const walletAddress = useCurrentUser().data?.user.walletAddress

  if (!parsedSneakerTokenId.success) {
    return (
      <Screen>
        <ErrorState
          message="That Sneaker couldn’t be found."
          onRetryPress={() => router.back()}
          retryLabel="Go back"
        />
      </Screen>
    )
  }
  if (walletAddress === undefined) {
    return <LoadingScreen accessibilityLabel="Loading your wallet" />
  }
  return (
    <TransferSneaker
      walletAddress={walletAddress}
      sneakerTokenId={BigInt(parsedSneakerTokenId.data)}
    />
  )
}

function TransferSneaker({
  walletAddress,
  sneakerTokenId,
}: {
  walletAddress: string
  sneakerTokenId: bigint
}) {
  const attributes = useSneakerAttributes(sneakerTokenId).data
  const gameConfig = useGameConfig().data
  const localActiveActivitySessionQuery = useLocalActiveActivitySession()
  const transfer = useTransferSneaker(sneakerTokenId)

  return (
    <Screen isScrollable>
      <TransferSneakerForm
        walletAddress={getAddress(walletAddress)}
        sneakerTokenId={sneakerTokenId}
        sneakerStats={
          attributes === undefined || gameConfig === undefined
            ? undefined
            : {
                level: attributes.level,
                efficiency: attributes.efficiency,
                durability: attributes.durability,
                maxDurability: gameConfig.maxDurability,
              }
        }
        // While the check loads, it counts as no run: settlement rejects a mid-run transfer anyway.
        isRunInProgress={Boolean(localActiveActivitySessionQuery.data)}
        transactionState={transfer.transactionState}
        onConfirmPress={transfer.submitTransfer}
        onTransactionReset={transfer.resetTransfer}
        onCancelPress={() => router.back()}
        onTransferred={() => router.dismissTo('/')}
      />
    </Screen>
  )
}
