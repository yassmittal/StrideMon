import { StyleSheet, Text, View } from 'react-native'
import { DarkPanel } from '../../../components/ui/DarkPanel'
import { colors, spacing, textStyles } from '../../../theme'

/** The settlement would be rejected if the Sneaker changed hands mid-run, so the app says so first. */
export const TRANSFER_BLOCKED_DURING_RUN_MESSAGE =
  'Finish your run first. A Sneaker can’t change hands during a run.'

type TransferPanelProps = {
  sneakerTokenId: bigint
  isRunInProgress: boolean
  onTransferPress: () => void
}

/** The way into sending the Sneaker to another wallet: the Sneaker tab's one dark, featured action. */
export function TransferPanel({
  sneakerTokenId,
  isRunInProgress,
  onTransferPress,
}: TransferPanelProps) {
  return (
    <View style={styles.container}>
      <DarkPanel
        title={`Send Sneaker #${sneakerTokenId}`}
        description="It’s an NFT you own. Its level, efficiency and durability go with it."
        onPress={onTransferPress}
        isDisabled={isRunInProgress}
      />
      {isRunInProgress && <Text style={styles.caption}>{TRANSFER_BLOCKED_DURING_RUN_MESSAGE}</Text>}
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
