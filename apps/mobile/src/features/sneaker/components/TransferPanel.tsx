import { StyleSheet, Text, View } from 'react-native'
import { DarkPanel } from '../../../components/ui/DarkPanel'
import { ExternalLink } from '../../../components/ui/ExternalLink'
import { buildHelpUrl } from '../../../config/website-urls'
import { colors, spacing, textStyles } from '../../../theme'

/** The settlement would be rejected if the Sneaker changed hands mid-run, so the app says so first. */
export const TRANSFER_BLOCKED_DURING_RUN_MESSAGE =
  'Finish your run first. A Sneaker can’t change hands during a run.'

/** A Founder Sneaker stays with its pass (D-041), and `SneakerNft` refuses to move it. */
export const FOUNDER_SNEAKER_TRANSFER_MESSAGE =
  'Founder Sneakers stay with their founder. They can’t be sent or sold.'

type TransferPanelProps = {
  sneakerTokenId: bigint
  isRunInProgress: boolean
  /** `undefined` while the chain read loads: the panel waits, disabled. */
  isFounderSneaker: boolean | undefined
  onTransferPress: () => void
}

/** The way into sending the Sneaker to another wallet: the Sneaker tab's one dark, featured action. */
export function TransferPanel({
  sneakerTokenId,
  isRunInProgress,
  isFounderSneaker,
  onTransferPress,
}: TransferPanelProps) {
  const blockedReasonMessage =
    isFounderSneaker === true
      ? FOUNDER_SNEAKER_TRANSFER_MESSAGE
      : isRunInProgress
        ? TRANSFER_BLOCKED_DURING_RUN_MESSAGE
        : null
  return (
    <View style={styles.container}>
      <DarkPanel
        title={`Send Sneaker #${sneakerTokenId}`}
        description="It’s an NFT you own. Its level, efficiency and durability go with it."
        onPress={onTransferPress}
        isDisabled={isFounderSneaker !== false || isRunInProgress}
      />
      {blockedReasonMessage !== null && <Text style={styles.caption}>{blockedReasonMessage}</Text>}
      {isFounderSneaker === true && (
        <ExternalLink label="Why?" url={buildHelpUrl('founder-sneaker-cant-send')} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.small,
  },
  caption: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
})
