import { StyleSheet, Text } from 'react-native'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { colors, fontSizes, fontWeights } from '../../../theme'

/** The settlement would be rejected if the Sneaker changed hands mid-run, so the app says so first. */
export const TRANSFER_BLOCKED_DURING_RUN_MESSAGE =
  'Finish your run first. A Sneaker can’t change hands during a run.'

type TransferPanelProps = {
  sneakerTokenId: bigint
  isRunInProgress: boolean
  onTransferPress: () => void
}

/** The way into sending the Sneaker to another wallet. */
export function TransferPanel({
  sneakerTokenId,
  isRunInProgress,
  onTransferPress,
}: TransferPanelProps) {
  return (
    <Card>
      <Text style={styles.title} accessibilityRole="header">
        Send to another wallet
      </Text>
      <Text style={styles.description}>
        Your Sneaker is an NFT you own. Give it to any wallet on Monad, and its level, efficiency
        and durability go with it.
      </Text>
      <Button
        label={`Send Sneaker #${sneakerTokenId}`}
        onPress={onTransferPress}
        isDisabled={isRunInProgress}
      />
      {isRunInProgress && <Text style={styles.caption}>{TRANSFER_BLOCKED_DURING_RUN_MESSAGE}</Text>}
    </Card>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  description: {
    fontSize: fontSizes.body,
    color: colors.textSecondary,
  },
  caption: {
    fontSize: fontSizes.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
})
